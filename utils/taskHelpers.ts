export const taskHelpers = {
  async getAllTaskMediaTypes() {
    try {
      const { data }: any = await getList(
        '/cash/task-type',
        'includes=media_type&limit=1000'
      );
      const medias = data.map((type: any) => type.media_type_id);
      const availableMedias = [...new Set(medias)];
      const mediaQuery = availableMedias.join();
      const { data: validMediaTypes }: any = await getList(
        '/ecosystem/media-type',
        `id=in(${mediaQuery})&order=name`,
        null
      );
      return validMediaTypes;
    } catch (error: any) {
      console.error(error);
      return null;
    }
  },
  async getTaskTypeList(
    mediaTypeId: string | null = null,
    teamId: string | null = null
  ) {
    try {
      const queryDefault = 'obsolete=false&limit=1000&order=name';
      const queryMediaTypeId = `obsolete=false&media_type_id=${mediaTypeId}&order=name`;
      const queryTeamId = `obsolete=false&as_team=${teamId}&limit=1000&order=name`;

      const query = mediaTypeId
        ? queryMediaTypeId
        : teamId
          ? queryTeamId
          : queryDefault;

      const { data }: any = await getList('/cash/task-type', query, null);
      return data;
    } catch (error: any) {
      console.error(error);
      return null;
    }
  },
  templateInsertion(template: { content: string }, taskContent: string | null) {
    const templateContent = template.content ? template.content : '';
    if (taskContent) {
      return (taskContent += templateContent);
    } else {
      return templateContent;
    }
  },
};
