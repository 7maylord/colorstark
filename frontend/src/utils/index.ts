export const colorMap: { [key: number]: { name: string; hex: string } } = {
  0: { name: 'Red', hex: '#FF0000' },
  1: { name: 'Blue', hex: '#0000FF' },
  2: { name: 'Green', hex: '#00FF00' },
  3: { name: 'Yellow', hex: '#FFFF00' },
  4: { name: 'Purple', hex: '#800080' },
};

export function feltToString(felt: any): string {
  if (felt === 0 || !felt) return 'Unnamed';
  try {
    return String.fromCharCode(...felt.toString().split('').map(Number));
  } catch {
    return 'Unnamed';
  }
}