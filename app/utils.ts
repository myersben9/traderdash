
export const abbreviateNumber = (number: number, decimals: number = 2): string => {
    const abbrev = ["K", "M", "B", "T"];
  
    for (let i = abbrev.length - 1; i >= 0; i--) {
  
      const size = Math.pow(10, (i + 1) * 3);
      if (Math.abs(number) >= size) {
        let shortened = Math.round((number * Math.pow(10, decimals)) / size) / Math.pow(10, decimals);
         if (shortened === 1000 && i < abbrev.length - 1) {
  
          shortened = 1;
          i++;
        }
        return `${shortened}${abbrev[i]}`;
      }
    }
    return number.toFixed(decimals);
  };

export const formatPrice = (price: number): string => {
    return `$${abbreviateNumber(price, 2)}`;
};

export const fetcher = (url : string) => fetch(url).then((r) => r.json())
