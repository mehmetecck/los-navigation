import { useState } from 'react';
import axios from 'axios';
import { useLanguage } from '../LanguageContext';
import './Account.css';
import {BsBoxArrowRight} from 'react-icons/bs';

function Account({ user, onLogin, onLogout }) {
  const { strings } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // 'data' or 'account'

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        if (!formData.email || !formData.password) {
          setError(strings.account.fieldRequired);
          setLoading(false);
          return;
        }

        const response = await axios.post('/api/auth/login', {
          email: formData.email,
          password: formData.password
        });

        onLogin(response.data);
      } else {
        // Register
        if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
          setError(strings.account.fieldRequired);
          setLoading(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          setError(strings.account.passwordMismatch);
          setLoading(false);
          return;
        }

        const response = await axios.post('/api/auth/register', {
          username: formData.username,
          email: formData.email,
          password: formData.password
        });

        onLogin(response.data);
      }
    } catch (err) {
      setError(isLogin ? strings.account.loginError : strings.account.registerError);
    }

    setLoading(false);
  };

  const handleDeleteData = async () => {
    try {
      await axios.delete(`/api/auth/data/${user.id}`);
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete data:', err);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await axios.delete(`/api/auth/account/${user.id}`);
      onLogout();
    } catch (err) {
      console.error('Failed to delete account:', err);
    }
  };

  // Not logged in - show login/register form
  if (!user) {
    return (
      <div className="account animate-fadeIn">
        <div className="account-card">
          <h2 className="account-title">{strings.account.title}</h2>

          <div className="auth-tabs">
            <button 
              className={`auth-tab ${isLogin ? 'active' : ''}`}
              onClick={() => { setIsLogin(true); setError(''); }}
            >
              {strings.account.login}
            </button>
            <button 
              className={`auth-tab ${!isLogin ? 'active' : ''}`}
              onClick={() => { setIsLogin(false); setError(''); }}
            >
              {strings.account.register}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-group">
                <label>{strings.account.username}</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder={strings.account.usernamePlaceholder}
                />
              </div>
            )}

            <div className="form-group">
              <label>{strings.account.email}</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={strings.account.emailPlaceholder}
              />
            </div>

            <div className="form-group">
              <label>{strings.account.password}</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder={strings.account.passwordPlaceholder}
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label>{strings.account.confirmPassword}</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder={strings.account.confirmPasswordPlaceholder}
                />
              </div>
            )}

            {error && <div className="auth-error">{error}</div>}

            <button 
              type="submit" 
              className="auth-submit"
              disabled={loading}
            >
              {loading ? '...' : (isLogin ? strings.account.login : strings.account.register)}
            </button>
          </form>

          <div className="auth-switch">
            {isLogin ? strings.account.noAccount : strings.account.hasAccount}
            <button onClick={() => { setIsLogin(!isLogin); setError(''); }}>
              {isLogin ? strings.account.register : strings.account.login}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Logged in - show profile
  return (
    <div className="account animate-fadeIn">
      <div className="account-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h2>{strings.account.welcome(user.username)}</h2>
            <p className="profile-email">{user.email}</p>
          </div>
        </div>

        <button className="logout-btn" onClick={onLogout}>
          <BsBoxArrowRight size={18} />
          {strings.account.logout}
        </button>

        <div className="danger-zone">
          <h3>{strings.account.dangerZone}</h3>

          <div className="danger-item">
            <div className="danger-info">
              <span className="danger-title">{strings.account.deleteData}</span>
              <span className="danger-desc">{strings.account.deleteDataDesc}</span>
            </div>
            <button 
              className="danger-btn"
              onClick={() => setShowDeleteConfirm('data')}
            >
              {strings.account.deleteData}
            </button>
          </div>

          <div className="danger-item">
            <div className="danger-info">
              <span className="danger-title">{strings.account.deleteAccount}</span>
              <span className="danger-desc">{strings.account.deleteAccountDesc}</span>
            </div>
            <button 
              className="danger-btn danger-btn-severe"
              onClick={() => setShowDeleteConfirm('account')}
            >
              {strings.account.deleteAccount}
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="confirm-overlay">
            <div className="confirm-modal">
              <p>{strings.account.confirmDelete}</p>
              <div className="confirm-actions">
                <button 
                  className="confirm-cancel"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  {strings.account.cancel}
                </button>
                <button 
                  className="confirm-delete"
                  onClick={showDeleteConfirm === 'data' ? handleDeleteData : handleDeleteAccount}
                >
                  {strings.account.confirm}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Account;

