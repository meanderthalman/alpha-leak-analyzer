# 📈 Alpha Leak Analyzer: Portfolio Diagnostic Engine

**Alpha Leak Analyzer** is a high-performance portfolio diagnostic tool. It moves beyond simple "profit/loss" statements to visualize **Opportunity Cost**—showing you exactly how much wealth and time you are losing to market underperformance.

🚀 **Live Tool:** [https://meanderthalman.github.io/alpha-leak-analyzer/](https://meanderthalman.github.io/alpha-leak-analyzer/)

---

## 🛠️ Core Diagnostic Features

* **Alpha Leak Visualization:** Real-time comparison of your portfolio CAGR against benchmarks like Nifty 50, Midcap 150, and Gold.
* **The Time-Delay Tax:** A unique metric that calculates the exact number of additional years you must remain invested to recover capital lost to underperformance.
* **Inflation Engine:** A toggle to view "Real" purchasing power vs "Nominal" face value, accounting for a 6% annual inflation rate.
* **Stochastic Modeling:** Uses **Geometric Brownian Motion (GBM)** to simulate realistic market volatility, making the data look like real-world markets.
* **Performance Grading:** Instant diagnostics that grade your portfolio health from "Alpha Leader" to "Severe Leak."

## 🧠 Understanding the Metrics

### The Time-Delay Tax
This calculates the "catch-up" time required to reach a benchmark's value using the benchmark's own rate of return. It answers the question: *"How much of my life have I lost by holding this underperforming asset?"*

### The Inflation Paradox
When **Inflation Adjusted** is toggled ON:
1. **The Wealth Leak shrinks:** Because future money is discounted back to today's value.
2. **The Time Delay increases:** Because your "Real" growth engine is slower (e.g., a 13% return effectively becomes 7% after 6% inflation), making it harder to catch up.

## 🚀 How to Use
1. Enter your Initial Investment and Current Portfolio Value.
2. Set the Time Horizon to match how long you've held the assets.
3. Toggle **Inflation Adjusted** to see the impact on your real purchasing power.
4. Review the **Diagnostic Grade** to see if your portfolio needs a rebalance.

## 📄 License
This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**. 
See the [LICENSE](LICENSE) file for details.

---
Made with ❤️ by [Meanderthalman](https://github.com/meanderthalman)  
Questions or Feedback? Reach out at: [meanderthalman@proton.me](mailto:meanderthalman@proton.me)
