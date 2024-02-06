const REGEX_ERROR_PLAYBOOK =
  /playbook: ([^,]+),.*playbook_id: (\d+).*team_id:(\d+).*pipeline_id: (\d+)/;

export const usePlaybookHelpers = {
  handlePlaybookError(detail) {
    const match = detail.match(REGEX_ERROR_PLAYBOOK);

    let playbook = null;

    if (match) {
      const playbookName = match[1].trim();
      const playbookId = parseInt(match[2]);
      const teamId = parseInt(match[3]);
      const pipelineId = parseInt(match[4]);

      playbook = {
        name: playbookName,
        id: playbookId,
        team_id: teamId,
        pipeline_id: pipelineId,
      };
    }
    return playbook;
  },
  translateDetail(detail, playbookName) {
    if (/The playbook:/i.test(detail)) {
      return `O playbook ${playbookName} já está ativo para este time e pipeline. Ao clicar em "Concluir", você substituirá o playbook atual.`;
    } else {
      switch (detail) {
        default:
          return detail;
      }
    }
  },
};
