interface TaskIcon {
  icon: string;
  color: string;
  iconColor: string;
  backgroundColor: string;
}

interface TasksIcons {
  [key: string]: TaskIcon;
}

export const tasksIcons: TasksIcons = {
  mail: {
    icon: 'mail_outline',
    color: 'email-icon-bg',
    iconColor: 'email-icon-text',
    backgroundColor: 'email-icon-bg',
  },
  call: {
    icon: 'phone',
    color: 'phone-icon-bg',
    iconColor: 'phone-icon-text',
    backgroundColor: 'phone-icon-bg',
  },
  chat: {
    icon: 'mdi-whatsapp',
    color: 'chat-icon-bg',
    iconColor: 'chat-icon-text',
    backgroundColor: 'chat-icon-bg',
  },
  meeting: {
    icon: '',
    color: 'meeting-icon-bg',
    iconColor: 'meeting-icon-text',
    backgroundColor: 'meeting-icon-bg',
  },
  internal: {
    icon: '',
    color: 'internal-icon-bg',
    iconColor: 'internal-icon-text',
    backgroundColor: 'internal-icon-bg',
  },
  default: {
    icon: 'pending',
    color: 'default-icon-bg',
    iconColor: 'default-icon-text',
    backgroundColor: 'default-icon-bg',
  },
};
