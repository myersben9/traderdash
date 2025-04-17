

class DailyConditions:
    """
    DailyScreener class to filter stocks based on float shares, relative volume, and price.
    """
    def __init__(self, 
                 floatShares : int, 
                 relativeVolume : float, 
                 price : float
                ) -> None:
        self.floatShares : int = floatShares
        self.relativeVolume : float = relativeVolume
        self.price : float = price
        self.valid : bool = self.is_conditions_met()

    def is_valid_float(self) -> bool:
        return self.floatShares > 0 and self.floatShares < 10000000

    def is_valid_relative_volume(self) -> bool:
        return self.relativeVolume > 5

    def is_valid_price(self) -> bool:
        return self.price > 2 and self.price < 20

    def is_conditions_met(self) -> bool:
        """
        Check if the conditions are met for the stock to be considered valid.
        """
        conditions = [
            self.is_valid_float(),
            self.is_valid_relative_volume(),
            self.is_valid_price(),
        ]
        return all(conditions)
