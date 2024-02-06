import type { IPagination } from '../types/pagination';

interface NotificationState {
  notifications: any[];
  userNotifications: any[];
  notificationsDetails: IPagination;
  notificationsRefresh: INotificationRefresh;
  defaultQuery: string;
  query: string;
}

interface INotificationRefresh {
  interval: number;
  intervalId: number | null;
  taskIdToRead: number | null;
  pagination: boolean;
}

const notificationsUrl = '/ecosystem/notification';
const userNotificationsUrl = '/ecosystem/user-notifications';

const SUBTYPES: { [key: string]: string } = {
  email: 'E-mail',
  chat: 'Chat',
  reminder: 'Lembrete',
  partnership_approval: 'Oportunidade',
  csc_transfer: 'Solicitação',
  csc_voucher: 'Solicitação',
};

const getPreviewSubject = (notification: any) => {
  if (notification.entity_subtype == 'email') {
    return removeEmailChain(notification.subject);
  }
  if (notification.entity_subtype == 'reminder') {
    try {
      // const { media_type_name, scheduled_to } = notification.task;
      // eslint-disable-next-line no-undef
      // return `Tarefa de ${media_type_name} programada para ${$nuxt.$moment(`${scheduled_to}Z`).calendar()}`;
    } catch (error) {
      return notification.subject;
    }
  }
  return notification.subject;
};

const getMediaBase = (notification: any) => {
  if (notification.entity_subtype == 'reminder') {
    const extra = notification.task?.extra;

    if (extra) {
      const { modal } = JSON.parse(extra);
      return modal;
    }
    return 'default';
  }
  return notification.entity_subtype;
};

const removeEmailChain = (body: any) => {
  const weekDays = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
  for (const day of weekDays) {
    const index = body.indexOf(`Em ${day}.`);
    if (index > 0) {
      return body.substring(0, index);
    }
  }
  const index = body.indexOf('On ');
  if (index > 0) {
    return body.substring(0, index);
  }
  return body;
};

export const useNotificationStore = defineStore('ecosystemNotification', {
  state: (): NotificationState => ({
    notifications: [],
    userNotifications: [],
    notificationsDetails: {
      page: 0,
      hasNext: false,
      total: 0,
    },
    notificationsRefresh: {
      interval: 60000,
      intervalId: null,
      taskIdToRead: null,
      pagination: false,
    },
    defaultQuery:
      'entity_type=ne(csc_request)&order=id_desc&includes=contact,user,source',
    query: 'order=id_desc&includes=contact,user,source',
  }),
  getters: {
    notificationList: (state: NotificationState) => {
      return state.userNotifications.map((notification) => ({
        ...notification,
        contact: notification.contact_id ? { ...notification.contact } : null,
        preview: getPreviewSubject(notification),
        previewSubtype: SUBTYPES[notification.entity_subtype],
        mediaBase: getMediaBase(notification),
      }));
    },
    formattedNotifications: (state) => {
      const { quickChatWindowIsActive }: any = state.notificationsRefresh;
      if (quickChatWindowIsActive) {
        return state.userNotifications.filter(
          (notification) => notification.entity_id != quickChatWindowIsActive
        );
      } else {
        return state.userNotifications;
      }
    },
    notificationRefresh: (state) => {
      return state.notificationsRefresh;
    },
    notificationQuery: (state) => {
      return state.query;
    },
    notificationDefaultQuery: (state) => {
      return state.defaultQuery;
    },
    hasNewNotification: (state) => {
      return state.userNotifications.some((notification) => !notification.read);
    },
    groupByNotifications: (state) => {
      const notifications = state.userNotifications;
      const bundlers = [
        ...(new Set(
          notifications.map(({ entity_subtype, entity_id, read }) => {
            return JSON.stringify({ entity_subtype, entity_id, read });
          })
        ) as Set<string>),
      ].map(
        (jsonString: string) =>
          JSON.parse(jsonString) as {
            entity_subtype: string;
            entity_id: string;
            read: boolean;
          }
      );

      const groupedNotifications = bundlers.map((bundler) => {
        const notificationsIds = notifications
          .filter(
            ({ entity_subtype, entity_id, read }) =>
              entity_subtype == bundler.entity_subtype &&
              entity_id == bundler.entity_id &&
              read == bundler.read
          )
          .map(({ id }) => id);
        const lastNotification = notifications.find(
          (notification) => notification.id == Math.max(...notificationsIds)
        );
        return {
          ...lastNotification,
          contact: { ...lastNotification.contact },
          preview: getPreviewSubject(lastNotification),
          previewSubtype: lastNotification.entity_subtype
            ? SUBTYPES[lastNotification.entity_subtype]
            : 'Oportunidade',
          mediaBase: getMediaBase(lastNotification),
          notificationsIds,
        };
      });
      return groupedNotifications;
    },
    contacts: (state) => {
      const notifications = state.userNotifications;
      const contacts = notifications.map((notification) => ({
        id: notification.contact_id,
        name: notification.contact.name,
      }));
      return [
        ...new Map(contacts.map((contact) => [contact.id, contact])).values(),
      ];
    },
  },
  actions: {
    async fetchNotifications(query: string) {
      const { data }: any = await getList(notificationsUrl, query);
      this.notifications = data;
    },
    async fetchUserNotifications(query: string, reset = false) {
      const { data }: any = await getList(userNotificationsUrl, query);

      if (reset) this.userNotifications = data;
      else this.userNotifications = { ...this.userNotifications, ...data };
    },
    async setNotificationRefresh(refresh: INotificationRefresh) {
      this.notificationsRefresh = { ...this.notificationsRefresh, ...refresh };
    },
    async setNotificationQuery(query: string) {
      this.query = query;
    },
    async setNotificationDetails(details: IPagination) {
      this.notificationsDetails = { ...this.notificationsDetails, ...details };
    },
    async setUserNotifications(newNotifications: any) {
      this.userNotifications = newNotifications;
    },
  },
});
