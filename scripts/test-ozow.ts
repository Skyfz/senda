import { testOzowNotifications } from '../utils/test-ozow-notifications';

console.log('Starting Ozow notification tests...');
testOzowNotifications()
  .then(() => console.log('\nTests completed!'))
  .catch(error => console.error('Test error:', error));
