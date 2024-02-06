export default defineNuxtRouteMiddleware(async (to) => {
  const notificationStore = useNotificationStore();

  const { intervalId, interval, pagination } =
    notificationStore.notificationsRefresh;
  if (notificationStore.query !== notificationStore.defaultQuery) {
    notificationStore.setNotificationQuery(notificationStore.defaultQuery);
  }
  if (pagination) {
    notificationStore.setNotificationDetails({ page: 0 });
    notificationStore.setNotificationRefresh({
      pagination: false,
    });
  }
  if (!intervalId) {
    if (to.path !== '/') {
      getNotifications(notificationStore);
    }
    const intervalId = setInterval(() => {
      const { taskIdToRead } = notificationStore.notificationsRefresh;
      if (taskIdToRead) {
        readChatNotifications(taskIdToRead);
      }
      getNotifications();
    }, interval);
    notificationStore.setNotificationRefresh({
      intervalId,
    });
  }
});

const getNotifications = async (notificationStore) => {
  const { pagination } = notificationStore.notificationsRefresh;
  if (!pagination) {
    await notificationStore.fetchUserNotifications(
      notificationStore.query,
      true
    );
  } else {
    getNewNotifications(notificationStore);
  }
};

const readChatNotifications = async (entity_id) => {
  try {
    await updateData('/ecosystem/notification-read-by-entity-and-id', {
      entity_type: 'task',
      entity_id,
    });
  } catch (error) {
    console.log(error);
  }
};

const getNewNotifications = async (notificationStore) => {
  const lastNotificationId = Math.max(
    ...notificationStore.userNotifications.map(
      (notification) => notification.id
    )
  );
  try {
    const { data } = await getList(
      `/ecosystem/user-notifications?${notificationStore.query}`
    );
    const NewNotifications = data.filter(
      (notification) => notification.id > lastNotificationId
    );
    if (NewNotifications.length > 0) {
      notificationStore.setUserNotifications(NewNotifications);
    }
  } catch (error) {
    console.log(error);
  }
};
