export interface DateRangeItem {
  name: string;
  value: string;
  future: boolean;
}

export const dateRange: DateRangeItem[] = [
  { name: 'Ontem', value: 'yesterday', future: false },
  { name: 'Hoje', value: 'today', future: false },
  { name: 'Amanhã', value: 'tomorrow', future: true },
  { name: 'Semana passada', value: 'lastWeek', future: false },
  { name: 'Esta semana', value: 'thisWeek', future: false },
  { name: 'Próxima semana', value: 'nextWeek', future: true },
  { name: 'Mês passado', value: 'lastMonth', future: false },
  { name: 'Este mês', value: 'thisMonth', future: false },
  { name: 'Próximo mês', value: 'nextMonth', future: true },
  { name: 'Trimestre passado', value: 'lastQuarter', future: false },
  { name: 'Este trimestre', value: 'thisQuarter', future: false },
  { name: 'Próximo trimestre', value: 'nextQuarter', future: true },
];
