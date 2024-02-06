export const getMyProfile = async () => {
  const profileStore = useProfileStore();

  try {
    const { status, data } = await getItem('/ecosystem/my-profile');
    if (status === 'ok') {
      profileStore.setPreferences(true);
    }
    profileStore.setPreferences(data);
  } catch (error) {
    console.log(error);
  }
};

export default (context, inject) => {
  inject('getMyProfile', () => getMyProfile(context));
};
