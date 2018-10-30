importScripts('./ngsw-worker.js');

(function () {
  'use strict';

  const NOTIFICATION_OPTION_NAMES = [
    'actions', 'badge', 'body', 'data', 'dir', 'icon', 'image', 'lang', 'renotify',
    'requireInteraction', 'silent', 'tag', 'timestamp', 'title', 'vibrate'
  ];

  self.addEventListener('notificationclick', event => {
    const options = {};
    NOTIFICATION_OPTION_NAMES.filter(name => name in event.notification)
      .forEach(name => options[name] = event.notification[name]);

    if (event.notification.data) {
      event.notification.close();
      event.waitUntil(handleClick(event.action, options));
    }
  });

  async function handleClick(action, options) {
    const clientList = await self.clients.matchAll({
      includeUncontrolled: true,
      type: 'window'
    });
    if (clientList.length > 0) {
      // broadcast message
      clientList.forEach(client => client.postMessage({
        type: 'NOTIFICATION_CLICK',
        data: {
          action,
          notification: options
        }
      }))
      // focus client
      const firstClient = clientList[0];
      if ('focus' in firstClient) {
        await firstClient.focus();
      }
      // navigate to url
      return firstClient.navigate(options.data.url ? options.data.url : '/');
    } else {
      // open client 
      return self.clients.openWindow(options.data.url ? options.data.url : '/');
    }
  }
})()
