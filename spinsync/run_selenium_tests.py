#!/usr/bin/env python3
"""
Test Runner script for SpinSync Selenium Black Box Automation Suite.
Usage:
  python run_selenium_tests.py
  python run_selenium_tests.py --headed
  python run_selenium_tests.py -k "test_01"
"""
import sys
import os
import subprocess
import time
import urllib.request
import argparse


def is_server_running(url="http://localhost:5173"):
    try:
        with urllib.request.urlopen(url, timeout=2) as response:
            return response.status in (200, 304)
    except Exception:
        return False


def start_local_server(project_root, port=5173):
    """
    Starts local server:
    1. If pre-built static bundle 'spinsync/dist' exists, use Python's built-in http.server (instant, zero Node.js/npm dependencies required).
    2. Otherwise, falls back to 'npm run preview'.
    """
    dist_dir = os.path.join(project_root, "spinsync", "dist")
    if os.path.exists(dist_dir) and os.path.exists(os.path.join(dist_dir, "index.html")):
        print(f"[*] Launching built SpinSync web portal on http://localhost:{port}...")
        return subprocess.Popen(
            [sys.executable, "-m", "http.server", str(port), "--directory", dist_dir],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    else:
        print(f"[*] Starting Vite preview server from spinsync on http://localhost:{port}...")
        return subprocess.Popen(
            ["npm", "run", "preview", "--", "--port", str(port), "--host", "localhost"],
            cwd=os.path.join(project_root, "spinsync"),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            shell=True,
        )


def main():
    parser = argparse.ArgumentParser(description="SpinSync Selenium Black Box Test Runner")
    parser.add_argument("--headed", action="store_true", help="Run browser in visible mode")
    parser.add_argument("--browser", default="chrome", choices=["chrome", "edge"], help="Browser to test")
    parser.add_argument("--url", default="http://localhost:5173", help="Base web app URL")
    parser.add_argument("--report", default="selenium_tests/reports/report.html", help="HTML report output path")
    args, extra_args = parser.parse_known_args()

    project_root = os.path.dirname(os.path.abspath(__file__))
    venv_python = os.path.join(project_root, ".venv", "Scripts", "python.exe")

    if not os.path.exists(venv_python):
        venv_python = sys.executable

    server_process = None
    if not is_server_running(args.url):
        server_process = start_local_server(project_root, port=5173)

        # Wait for server to become responsive
        for _ in range(30):
            time.sleep(0.5)
            if is_server_running(args.url):
                print(f"[+] SpinSync web portal is active and listening on {args.url}!")
                break
        else:
            print(f"[-] Timed out waiting for web server on {args.url}.")
            if server_process:
                server_process.terminate()
            sys.exit(1)
    else:
        print(f"[+] Detected active SpinSync web server on {args.url}.")

    # Prepare report dir
    report_dir = os.path.dirname(os.path.join(project_root, args.report))
    os.makedirs(report_dir, exist_ok=True)

    # Build pytest command
    pytest_cmd = [
        venv_python,
        "-m",
        "pytest",
        "selenium_tests/tests",
        f"--base-url={args.url}",
        f"--browser={args.browser}",
        f"--html={args.report}",
        "--self-contained-html",
    ]

    if args.headed:
        pytest_cmd.append("--headed")

    pytest_cmd.extend(extra_args)

    print("\n" + "=" * 70)
    print(" Executing SpinSync Selenium Black Box Test Suite")
    print(f" Browser: {args.browser.title()} | Headed: {args.headed} | Target: {args.url}")
    print("=" * 70 + "\n")

    exit_code = 0
    try:
        result = subprocess.run(pytest_cmd, cwd=project_root)
        exit_code = result.returncode
    finally:
        if server_process:
            print("[*] Stopping local web server...")
            try:
                server_process.terminate()
                server_process.kill()
            except Exception:
                pass

    print("\n" + "=" * 70)
    if exit_code == 0:
        print(" [SUCCESS] All Black Box Selenium tests passed!")
    else:
        print(f" [WARNING] Test suite finished with exit code {exit_code}.")
    print(f" Test Report available at: {os.path.abspath(args.report)}")
    print("=" * 70 + "\n")

    sys.exit(exit_code)


if __name__ == "__main__":
    main()
