import { useState } from "react";
import { supabase } from "../../lib/supabase";

function SupabaseAuthTest() {
  const [testResult, setTestResult] = useState("");
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setTestResult("Testing connection...");

    try {
      // Test basic connection
      const { data, error } = await supabase
        .from("profiles")
        .select("count")
        .limit(1);

      if (error) {
        setTestResult(`❌ Connection failed: ${error.message}`);
      } else {
        setTestResult("✅ Connection successful!");
      }
    } catch (err) {
      setTestResult(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSignUp = async () => {
    setLoading(true);
    setTestResult("Testing signup...");

    try {
      const testEmail = `test-${Date.now()}@example.com`;
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: "testpassword123",
      });

      if (error) {
        setTestResult(`❌ Signup failed: ${error.message}`);
      } else {
        setTestResult(`✅ Signup successful! Check email: ${testEmail}`);
      }
    } catch (err) {
      setTestResult(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Supabase Auth Test</h2>

      <div className="space-y-4">
        <button
          onClick={testConnection}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Test Connection
        </button>

        <button
          onClick={testSignUp}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50 ml-2"
        >
          Test Signup
        </button>

        {testResult && (
          <div className="mt-4 p-3 bg-gray-100 rounded">
            <pre className="text-sm">{testResult}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default SupabaseAuthTest;
