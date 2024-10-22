import {
    createContext,
    useContext,
    useEffect,
    // useLayoutEffect,
    useState
} from 'react';

import {api} from '../Api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const authContext = useContext(AuthContext);

    if (!authContext) {
        throw new Error('useAuth must be used within a AuthProvider');
    }

    return authContext;
}

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAccessToken = async () => {
            setLoading(true);
            try {
                const data = {"orgId":"00D8V000002KyN3","developerName":"ESA_Web_Deployment","capabilitiesVersion":"248"};

                const response = await api.post('/iamessage/v1/authorization/unauthenticated/accessToken', data);
                
                console.log('Access Token: ', response.accessToken);
                // setToken(response.accessToken);
                api.setAuthToken(response.accessToken);
                setAuthenticated(true);
            } catch {
                // setToken(null);
                api.setAuthToken(null);
                setAuthenticated(false);
            } finally {
                setLoading(false);
            }
        }

        fetchAccessToken();
    }, []);

    /*
    useLayoutEffect(() => {
        api.setAuthToken(token);
        /*
        const authInterceptor = api.interceptors.request.use((config) => {
            config.headers.Authorization =
               !config._retry && token
                 ? `Bearer ${token}`
                 : config.headers.Authorization;
            return config;
        });

        return () => {
            api.interceptors.request.eject(authInterceptor);
        };
        
    }, [token]);*/


    
    return <AuthContext.Provider value={{isAuthenticated, loading}}> {children} </AuthContext.Provider>;
}
