
import { useTelegram } from '../hooks/useTelegram';
import './FriendsScreen.css';

export function FriendsScreen() {
  const { hapticSuccess } = useTelegram();

  const handleInvite = () => {
    // Generate a Telegram share link
    const botUrl = 'https://t.me/your_bot_name/app';
    const text = 'Join me and earn tokens together!';
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(botUrl)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
    hapticSuccess();
  };

  const friends = [
    { name: 'Alice', score: 14500, league: 'Silver' },
    { name: 'Bob', score: 8200, league: 'Bronze' },
    { name: 'Charlie', score: 2100, league: 'Bronze' },
  ];

  return (
    <div className="friends-screen">
      <div className="friends-header">
        <h1 className="friends-title">Friends</h1>
        <p className="friends-subtitle">Invite friends to get bonuses!</p>
      </div>

      <div className="invite-box">
        <div className="invite-text">
          <h3>Invite a friend</h3>
          <p><span className="bonus-pill">+5,000</span> for you and your friend</p>
        </div>
        <button className="invite-button" onClick={handleInvite}>
          Invite
        </button>
      </div>

      <h2 className="leaderboard-title">Leaderboard (Mock)</h2>
      <div className="friends-list">
        {friends.map((friend, i) => (
          <div key={i} className="friend-card">
            <div className="friend-avatar">{friend.name.charAt(0)}</div>
            <div className="friend-info">
              <span className="friend-name">{friend.name}</span>
              <span className="friend-league">{friend.league}</span>
            </div>
            <div className="friend-score">
              🪙 {friend.score.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
