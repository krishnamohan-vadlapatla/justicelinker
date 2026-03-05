import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './i18n';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <App />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: '#1A2540',
                            color: '#fff',
                            border: '1px solid #2A3A55',
                            borderRadius: '12px',
                            fontSize: '14px',
                        },
                        success: { iconTheme: { primary: '#4CAF50', secondary: '#fff' } },
                        error: { iconTheme: { primary: '#F44336', secondary: '#fff' } },
                    }}
                />
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);
