#!/usr/bin/env python3
"""
Comprehensive Backend Testing for DevMind AI Assistant
Tests all core functionality including Grok AI, Weaviate, and MongoDB integrations
"""

import requests
import json
import time
import uuid
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8001"  # Will be updated based on environment
API_BASE = f"{BASE_URL}/api"

class DevMindTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        self.project_id = None
        
    def log_test(self, test_name, success, message, details=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_health_check(self):
        """Test /api/health endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy":
                    self.log_test("Health Check", True, "Backend is healthy")
                    return True
                else:
                    self.log_test("Health Check", False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_test("Health Check", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Health Check", False, f"Connection error: {str(e)}")
            return False
    
    def test_create_project(self):
        """Test POST /api/projects"""
        try:
            project_data = {
                "name": "DevMind Test Project",
                "description": "A comprehensive test project for DevMind AI Assistant",
                "repository_url": "https://github.com/example/devmind-test"
            }
            
            response = self.session.post(
                f"{API_BASE}/projects",
                json=project_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data and data.get("message"):
                    self.project_id = data["id"]
                    self.log_test("Create Project", True, f"Project created with ID: {self.project_id}")
                    return True
                else:
                    self.log_test("Create Project", False, f"Invalid response format: {data}")
                    return False
            else:
                self.log_test("Create Project", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Create Project", False, f"Error: {str(e)}")
            return False
    
    def test_list_projects(self):
        """Test GET /api/projects"""
        try:
            response = self.session.get(f"{API_BASE}/projects", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "projects" in data and isinstance(data["projects"], list):
                    project_count = len(data["projects"])
                    self.log_test("List Projects", True, f"Retrieved {project_count} projects")
                    return True
                else:
                    self.log_test("List Projects", False, f"Invalid response format: {data}")
                    return False
            else:
                self.log_test("List Projects", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("List Projects", False, f"Error: {str(e)}")
            return False
    
    def test_code_analysis(self):
        """Test POST /api/code/analyze with Grok AI"""
        try:
            code_sample = """
def calculate_fibonacci(n):
    if n <= 1:
        return n
    else:
        return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)

# This is inefficient recursive implementation
result = calculate_fibonacci(10)
print(f"Fibonacci of 10 is: {result}")
"""
            
            analysis_request = {
                "code": code_sample,
                "language": "python",
                "file_path": "fibonacci.py",
                "context": "Testing recursive fibonacci implementation for performance analysis"
            }
            
            response = self.session.post(
                f"{API_BASE}/code/analyze",
                json=analysis_request,
                timeout=30  # Longer timeout for AI processing
            )
            
            if response.status_code == 200:
                data = response.json()
                if "analysis" in data and "analysis_id" in data:
                    analysis_length = len(data["analysis"])
                    self.log_test("Code Analysis", True, f"Analysis completed ({analysis_length} chars)")
                    return True
                else:
                    self.log_test("Code Analysis", False, f"Invalid response format: {data}")
                    return False
            else:
                self.log_test("Code Analysis", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Code Analysis", False, f"Error: {str(e)}")
            return False
    
    def test_commit_analysis(self):
        """Test POST /api/commits/analyze for commit storytelling"""
        try:
            git_diff = """
diff --git a/src/auth.py b/src/auth.py
index 1234567..abcdefg 100644
--- a/src/auth.py
+++ b/src/auth.py
@@ -10,6 +10,12 @@ def authenticate_user(username, password):
     if not username or not password:
         return False
     
+    # Add rate limiting to prevent brute force attacks
+    if is_rate_limited(username):
+        logger.warning(f"Rate limit exceeded for user: {username}")
+        return False
+    
     user = get_user_from_db(username)
     if user and verify_password(password, user.password_hash):
         return True
"""
            
            commit_request = {
                "diff": git_diff,
                "files_changed": ["src/auth.py"],
                "project_context": "Authentication system enhancement for security"
            }
            
            response = self.session.post(
                f"{API_BASE}/commits/analyze",
                json=commit_request,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if "commit_story" in data and "analysis_id" in data:
                    story_length = len(data["commit_story"])
                    self.log_test("Commit Analysis", True, f"Commit story generated ({story_length} chars)")
                    return True
                else:
                    self.log_test("Commit Analysis", False, f"Invalid response format: {data}")
                    return False
            else:
                self.log_test("Commit Analysis", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Commit Analysis", False, f"Error: {str(e)}")
            return False
    
    def test_debug_session(self):
        """Test POST /api/debug/session for debugging assistance"""
        try:
            debug_request = {
                "error_message": "AttributeError: 'NoneType' object has no attribute 'split'",
                "code_context": """
def process_user_input(user_data):
    name = user_data.get('name')
    # Bug: name could be None
    first_name = name.split(' ')[0]  # This line causes the error
    return first_name.upper()

result = process_user_input({'email': 'test@example.com'})
""",
                "language": "python",
                "stack_trace": "Traceback (most recent call last):\n  File \"test.py\", line 7, in <module>\n    result = process_user_input({'email': 'test@example.com'})\n  File \"test.py\", line 4, in process_user_input\n    first_name = name.split(' ')[0]\nAttributeError: 'NoneType' object has no attribute 'split'"
            }
            
            response = self.session.post(
                f"{API_BASE}/debug/session",
                json=debug_request,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if "debug_suggestions" in data and "session_id" in data:
                    suggestions_length = len(data["debug_suggestions"])
                    self.log_test("Debug Session", True, f"Debug suggestions provided ({suggestions_length} chars)")
                    return True
                else:
                    self.log_test("Debug Session", False, f"Invalid response format: {data}")
                    return False
            else:
                self.log_test("Debug Session", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Debug Session", False, f"Error: {str(e)}")
            return False
    
    def test_store_embedding(self):
        """Test POST /api/embeddings/store for Weaviate integration"""
        try:
            if not self.project_id:
                self.log_test("Store Embedding", False, "No project ID available (create project first)")
                return False
            
            embedding_request = {
                "code": "def hello_world():\n    print('Hello, DevMind!')\n    return 'success'",
                "file_path": "hello.py",
                "language": "python",
                "project_id": self.project_id
            }
            
            response = self.session.post(
                f"{API_BASE}/embeddings/store",
                json=embedding_request,
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "successfully" in data["message"].lower():
                    self.log_test("Store Embedding", True, "Code embedding stored in Weaviate")
                    return True
                else:
                    self.log_test("Store Embedding", False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_test("Store Embedding", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Store Embedding", False, f"Error: {str(e)}")
            return False
    
    def test_search_similar_code(self):
        """Test POST /api/code/search-similar for vector search"""
        try:
            search_request = {
                "query_code": "def greet():\n    print('Hello!')",
                "language": "python",
                "limit": 3
            }
            
            response = self.session.post(
                f"{API_BASE}/code/search-similar",
                json=search_request,
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                if "similar_code" in data and isinstance(data["similar_code"], list):
                    results_count = len(data["similar_code"])
                    self.log_test("Search Similar Code", True, f"Found {results_count} similar code snippets")
                    return True
                else:
                    self.log_test("Search Similar Code", False, f"Invalid response format: {data}")
                    return False
            else:
                self.log_test("Search Similar Code", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Search Similar Code", False, f"Error: {str(e)}")
            return False
    
    def test_learning_patterns(self):
        """Test GET /api/learn/patterns/{project_id}"""
        try:
            if not self.project_id:
                self.log_test("Learning Patterns", False, "No project ID available (create project first)")
                return False
            
            response = self.session.get(
                f"{API_BASE}/learn/patterns/{self.project_id}",
                timeout=20
            )
            
            if response.status_code == 200:
                data = response.json()
                if "patterns" in data and "sessions_count" in data and "analyses_count" in data:
                    sessions = data["sessions_count"]
                    analyses = data["analyses_count"]
                    self.log_test("Learning Patterns", True, f"Patterns retrieved (sessions: {sessions}, analyses: {analyses})")
                    return True
                else:
                    self.log_test("Learning Patterns", False, f"Invalid response format: {data}")
                    return False
            else:
                self.log_test("Learning Patterns", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Learning Patterns", False, f"Error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run comprehensive test suite"""
        print("🚀 Starting DevMind Backend Comprehensive Testing")
        print("=" * 60)
        
        # Test sequence based on dependencies
        tests = [
            ("Health Check", self.test_health_check),
            ("Create Project", self.test_create_project),
            ("List Projects", self.test_list_projects),
            ("Code Analysis (Grok AI)", self.test_code_analysis),
            ("Commit Analysis", self.test_commit_analysis),
            ("Debug Session", self.test_debug_session),
            ("Store Embedding (Weaviate)", self.test_store_embedding),
            ("Search Similar Code", self.test_search_similar_code),
            ("Learning Patterns", self.test_learning_patterns),
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in tests:
            print(f"\n🔍 Running: {test_name}")
            try:
                success = test_func()
                if success:
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                self.log_test(test_name, False, f"Test execution error: {str(e)}")
                failed += 1
            
            # Small delay between tests
            time.sleep(0.5)
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed/(passed+failed)*100):.1f}%")
        
        # Critical failures
        critical_tests = ["Health Check", "Create Project", "Code Analysis (Grok AI)"]
        critical_failures = [r for r in self.test_results if not r["success"] and any(ct in r["test"] for ct in critical_tests)]
        
        if critical_failures:
            print(f"\n🚨 CRITICAL FAILURES: {len(critical_failures)}")
            for failure in critical_failures:
                print(f"   - {failure['test']}: {failure['message']}")
        
        return passed, failed, self.test_results

def main():
    """Main testing function"""
    # Try to get backend URL from environment or use default
    import os
    backend_url = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
    
    # Update global BASE_URL
    global BASE_URL, API_BASE
    BASE_URL = backend_url
    API_BASE = f"{BASE_URL}/api"
    
    print(f"🎯 Testing DevMind Backend at: {BASE_URL}")
    
    tester = DevMindTester()
    passed, failed, results = tester.run_all_tests()
    
    # Save detailed results
    results_file = "/app/backend_test_results.json"
    with open(results_file, 'w') as f:
        json.dump({
            "summary": {"passed": passed, "failed": failed, "total": passed + failed},
            "backend_url": BASE_URL,
            "timestamp": datetime.now().isoformat(),
            "detailed_results": results
        }, f, indent=2)
    
    print(f"\n📄 Detailed results saved to: {results_file}")
    
    # Return exit code based on critical failures
    critical_tests = ["Health Check", "Create Project"]
    critical_failures = [r for r in results if not r["success"] and any(ct in r["test"] for ct in critical_tests)]
    
    if critical_failures:
        print("\n🚨 CRITICAL TESTS FAILED - Backend not functional")
        return 1
    elif failed > 0:
        print(f"\n⚠️  Some tests failed but core functionality works")
        return 0
    else:
        print("\n🎉 ALL TESTS PASSED - Backend fully functional")
        return 0

if __name__ == "__main__":
    exit(main())