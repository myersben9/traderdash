# Load symbols into randomly selected list
# Grab the 'Symbols' column from nasdaq.csv
import pandas as pd
import random
from typing import Dict, List, Tuple, Any


class Symbols():
    """
    A class that stores the list of loaded symbols as an object
    """
    def __init__(self, 
                 csv_path: str = 'nasdaq.csv', 
                 sample_size: int = 30,
                 random_sample: bool = True,
                 symbol_column: str = 'Symbol'):
        self.csv_path = csv_path
        self.sample_size = sample_size
        self.random_sample = random_sample
        self.symbol_column = symbol_column
        self.symbols = self.load_symbols()

    def load_symbols(self) -> List[str]: 
        """
        Loads a sample of symbols from nasdaq.csv
        """
        try:
            nasdaq = pd.read_csv(self.csv_path)
            symbols = nasdaq[self.symbol_column].tolist()
            if self.random_sample:
                sample_symbols = random.sample(symbols, self.sample_size) 
            else:
                sample_symbols = symbols[:self.sample_size]
        except:
            raise Exception("Error loading nasdaq.csv")

        if not sample_symbols:
            raise Exception("No symbols found in nasdaq.csv")
        
        return sample_symbols

if __name__ == "__main__":
    sample_symbols = Symbols()
    print(sample_symbols.symbols)