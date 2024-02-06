export const generateList = (
  type: 'state' | 'temperature'
): { name: string; value: number }[] => {
  const list: { name: string; value: number }[] = [];
  for (let i = 0; i <= 10; i++) {
    if (type === 'state') {
      list.push({ name: `${i * 10}%`, value: i });
    } else if (type === 'temperature') {
      list.push({ name: `${i * 10}°`, value: i * 10 });
    }
  }
  return list;
};

export const stageTriggersList = {
  data: (): {
    stateList: { name: string; value: number }[];
    temperatureList: { name: string; value: number }[];
  } => ({
    stateList: generateList('state'),
    temperatureList: generateList('temperature'),
  }),
};
