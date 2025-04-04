import asyncio
import aiohttp
import requests
from bs4 import BeautifulSoup
from fake_useragent import UserAgent
from itertools import cycle

class ProxyFetcher:
    """Fetches free proxies from a public website."""
    PROXY_WEBSITE = "https://www.sslproxies.org/"
    
    def __init__(self):
        self.ua = UserAgent()
    
    def get_free_proxies(self) -> list:
        headers = {"User-Agent": self.ua.random}
        response = requests.get(self.PROXY_WEBSITE, headers=headers)
        if response.status_code != 200:
            raise Exception("Failed to fetch proxies")
        
        soup = BeautifulSoup(response.text, "html.parser")
        table = soup.find("table", class_="table-striped")
        if not table:
            return []
        
        proxy_list = []
        rows = table.find_all("tr")[1:]  # skip header row
        for row in rows:
            columns = row.find_all("td")
            if len(columns) >= 2:
                ip = columns[0].text.strip()
                port = columns[1].text.strip()
                proxy_list.append(f"{ip}:{port}")
        return proxy_list

class ProxyValidator:
    """Validates a proxy asynchronously."""
    TEST_URL = "http://httpbin.org/ip"
    
    def __init__(self):
        self.ua = UserAgent()
    
    async def test_proxy(self, proxy: str) -> bool:
        proxies = {
            "http": f"http://{proxy}",
            "https": f"http://{proxy}",
        }
        headers = {"User-Agent": self.ua.random}
        try:
            async with aiohttp.ClientSession(headers=headers) as session:
                async with session.get(self.TEST_URL, proxy=proxies["http"], timeout=3) as response:
                    return response.status == 200
        except Exception:
            return False

class ProxyRotator:
    """
    Combines fetching and validating proxies asynchronously.
    Ensures that a working proxy is returned, and rotates after every 1000 requests.
    If the current proxy is detected as no longer valid or rotation threshold reached,
    it tests candidate proxies until a valid one is found.
    """
    ROTATE_AFTER = 1000  # Rotate proxy after this many requests
    
    def __init__(self):
        self.fetcher = ProxyFetcher()
        self.validator = ProxyValidator()
        self.working_proxies = []
        self.proxy_cycle = None
        self.current_proxy = None
        self.request_count = 0

    async def initialize(self):
        """Fetches free proxies and validates them asynchronously."""
        free_proxies = self.fetcher.get_free_proxies()
        print(f"Fetched {len(free_proxies)} proxies; validating...")
        # Validate proxies concurrently
        tasks = [self.validator.test_proxy(proxy) for proxy in free_proxies]
        results = await asyncio.gather(*tasks)
        self.working_proxies = [proxy for proxy, valid in zip(free_proxies, results) if valid]
        if not self.working_proxies:
            raise Exception("No working proxies found!")
        self.proxy_cycle = cycle(self.working_proxies)
        self.current_proxy = next(self.proxy_cycle)
        self.request_count = 0
        print(f"Initialized with {len(self.working_proxies)} working proxies. Starting with {self.current_proxy}.")
        self.save_valid_proxies()
    
    def save_valid_proxies(self, filename="valid_proxies.txt"):
        """Saves the list of valid proxies to a text file."""
        with open(filename, "w") as file:
            for proxy in self.working_proxies:
                file.write(proxy + "\n")
        print(f"Saved {len(self.working_proxies)} valid proxies to {filename}")

    async def _rotate_proxy(self):
        """Rotates to the next valid proxy, testing candidates until one works."""
        for _ in range(len(self.working_proxies)):
            candidate = next(self.proxy_cycle)
            if await self.validator.test_proxy(candidate):
                self.current_proxy = candidate
                self.request_count = 0
                print(f"Rotated to new proxy: {self.current_proxy}")
                return
        # If none of the candidates work, reinitialize the proxy list.
        print("No valid candidate found; reinitializing proxy list...")
        await self.initialize()

    async def get_rotating_proxy(self) -> str:
        """
        Returns a validated proxy.
        - Always tests that the current proxy is still working.
        - Rotates after ROTATE_AFTER requests.
        - If the current proxy fails, immediately rotates until a valid one is found.
        """
        # Check current proxy validity with a short timeout.
        if not await self.validator.test_proxy(self.current_proxy):
            print(f"Current proxy {self.current_proxy} failed; rotating...")
            await self._rotate_proxy()
        # Rotate if we've hit the request threshold.
        elif self.request_count >= self.ROTATE_AFTER:
            print("Rotation threshold reached; rotating proxy...")
            await self._rotate_proxy()
        
        self.request_count += 1
        return self.current_proxy

# Usage example:
async def main():
    rotator = ProxyRotator()
    await rotator.initialize()
    
    # Simulate 10 requests (in production, the threshold would be 1000)
    for i in range(10):
        proxy = await rotator.get_rotating_proxy()
        print(f"Request {i+1}: Using proxy: {proxy}")
        # Simulate some request delay (optional)
        await asyncio.sleep(0.1)

if __name__ == "__main__":
    asyncio.run(main())