export const opportunityHelpers = {
  sumByTypes(products: any[], type: string): number {
    let sum = 0;
    const sumReducer = (acc: number, currentValue: any) =>
      acc + currentValue.value * currentValue.amount;
    const list = products.filter((product) => product.product.type === type);
    list && (sum = list.reduce(sumReducer, 0));
    return sum;
  },
  getValueModifier(extra: string | null): string {
    if (extra) {
      try {
        const parsedExtra = JSON.parse(extra);
        return parsedExtra.value_modifier || 'discount';
      } catch (error) {
        return 'discount';
      }
    }
    return 'discount';
  },
};
