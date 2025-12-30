import { supabase } from '@/lib/supabase';

export default async function TestPage() {
    let connectionStatus = 'Testing...';
    let error = null;

    try {
        const { data, error: testError } = await supabase
            .from('profiles')
            .select('count')
            .limit(1);

        if (testError) {
            error = testError.message;
            connectionStatus = 'Connection failed';
        } else {
            connectionStatus = 'Connected successfully!';
        }
    } catch (e: any) {
        error = e.message;
        connectionStatus = 'Connection error';
    }

    return (
        <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
            <h1>Supabase Connection Test</h1>
            <p><strong>Status:</strong> {connectionStatus}</p>
            {error && <p style={{ color: 'red' }}><strong>Error:</strong> {error}</p>}
            <hr />
            <p>If you see "relation public.profiles does not exist", you need to run the SQL schema.</p>
        </div>
    );
}
