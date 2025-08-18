import React, { useState } from "react";
import {
  Play,
  RotateCcw,
  Coffee,
  Users,
  DollarSign,
  Package,
  ThermometerSun,
} from "lucide-react";

const CoffeeShopSimulation = () => {
  const [gameState, setGameState] = useState({
    cash: 15000,
    staff: 3,
    coffeeBeans: 270,
    pastries: 1200,
    customerSatisfaction: 75,
    dailyCustomers: 120,
    reputation: 70,
    month: 1,
    revenue: 0,
    expenses: 0,
    netProfit: 0,
    equipmentCondition: 90,
  });

  const playSound = (soundFile) => {
    try {
      const audio = new Audio(`sounds/${soundFile}`);
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Audio play failed:', e));
    } catch (e) {
      console.log('Audio creation failed:', e);
    }
  };

  const [decisions, setDecisions] = useState({
    staffChanges: 0,
    coffeePrice: 4.5,
    pastryPrice: 3.0,
    beanQuality: 2,
    marketingSpend: 0,
    equipmentMaintenance: 0,
    pastryOrders: 0,
    beanOrders: 0,
  });

  const [gameLog, setGameLog] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [showCashFlow, setShowCashFlow] = useState(false);
  const [cashFlowData, setCashFlowData] = useState(null);

  const randomEvents = [
    {
      text: "Busy morning rush - extra customers!",
      effect: { dailyCustomers: 20 },
    },
    {
      text: "Competitor opens nearby",
      effect: { dailyCustomers: -15, reputation: -5 },
    },
    {
      text: "Food blogger writes positive review",
      effect: { reputation: 15, dailyCustomers: 25 },
    },
    { text: "Coffee bean supplier delay", effect: { coffeeBeans: -15 } },
    {
      text: "Local office workers discover your shop",
      effect: { dailyCustomers: 30 },
    },
    {
      text: "Rainy week reduces foot traffic",
      effect: { dailyCustomers: -10 },
    },
    { text: "Equipment breakdown", effect: { equipmentCondition: -15 } },
    {
      text: "University students find your WiFi",
      effect: { dailyCustomers: 15, customerSatisfaction: -5 },
    },
    { text: "Health inspector visit - all good!", effect: { reputation: 8 } },
    {
      text: "Local newspaper features your shop",
      effect: { reputation: 12, dailyCustomers: 20 },
    },
  ];

  const resetGame = () => {
    setGameState({
      cash: 15000,
      staff: 3,
      coffeeBeans: 270,
      pastries: 1200,
      customerSatisfaction: 75,
      dailyCustomers: 120,
      reputation: 70,
      month: 1,
      revenue: 0,
      expenses: 0,
      netProfit: 0,
      equipmentCondition: 90,
    });
    setDecisions({
      staffChanges: 0,
      coffeePrice: 4.5,
      pastryPrice: 3.0,
      beanQuality: 2,
      marketingSpend: 0,
      equipmentMaintenance: 0,
      pastryOrders: 0,
      beanOrders: 0,
    });
    setGameLog([]);
    setCurrentEvent(null);
    setShowResults(false);
    setShowCashFlow(false);
    setCashFlowData(null);
  };

  const getBeanQualityName = (level) => {
    switch (level) {
      case 1:
        return "Basic";
      case 2:
        return "Premium";
      case 3:
        return "Specialty";
      default:
        return "Premium";
    }
  };

  const processMonth = () => {
    if (gameState.month > 12 || gameState.cash <= 0) {
      setShowResults(true);
      return;
    }

    setCurrentEvent(null);

    setGameState((prev) => {
      // === SIMPLE INVENTORY CALCULATION ===
      // Start with what we have
      const startingBeans = prev.coffeeBeans;

      // Add what player ordered
      const totalBeans = startingBeans + decisions.beanOrders;

      // === STAFF AND CUSTOMER CALCULATIONS ===
      const newStaff = Math.max(1, prev.staff + decisions.staffChanges);

      // Monthly customers (simplified)
      const monthlyCustomers = prev.dailyCustomers * 30;

      // Price affects customer count
      const priceImpact =
        decisions.coffeePrice > 5.0
          ? 0.9
          : decisions.coffeePrice < 4.0
          ? 1.1
          : 1.0;
      const adjustedCustomers = monthlyCustomers * priceImpact;

      // Staff can serve limited customers
      const maxCustomersFromStaff = newStaff * 1200; // Each staff serves 40/day * 30 days
      const actualCustomers = Math.min(
        adjustedCustomers,
        maxCustomersFromStaff
      );

      // === SALES CALCULATION (SUPER SIMPLE) ===
      // Each customer has a 70% chance of buying coffee
      const coffeeBuyers = actualCustomers * 0.7;

      // Each kg of beans makes 10 cups (conservative estimate)
      const maxCoffeesFromBeans = totalBeans * 10;

      // Actual coffee sales (limited by either demand or supply)
      const coffeesSold = Math.min(coffeeBuyers, maxCoffeesFromBeans);

      // Beans used = coffees sold / 10
      const beansUsed = coffeesSold / 10;

      // REMAINING BEANS = TOTAL - USED
      let remainingBeans = totalBeans - beansUsed;

      // Pastries
      const pastryBuyers = actualCustomers * 0.3;
      const totalPastries = prev.pastries + decisions.pastryOrders;
      const pastriesSold = Math.min(pastryBuyers, totalPastries);
      const remainingPastries = totalPastries - pastriesSold;

      // === REVENUE ===
      const coffeeRevenue = coffeesSold * decisions.coffeePrice;
      const pastryRevenue = pastriesSold * decisions.pastryPrice;
      const totalRevenue = coffeeRevenue + pastryRevenue;

      // === COSTS ===
      const beanCostPerKg =
        decisions.beanQuality === 1
          ? 12
          : decisions.beanQuality === 2
          ? 18
          : 28;
      const beanCosts = decisions.beanOrders * beanCostPerKg;
      const staffCosts = newStaff * 700;
      const pastryCosts = decisions.pastryOrders * 1.5;
      const rent = 2000;
      const utilities = 450;
      const maintenanceCosts = decisions.equipmentMaintenance * 50;
      const marketingCosts = decisions.marketingSpend * 100;

      const totalExpenses =
        beanCosts +
        staffCosts +
        pastryCosts +
        rent +
        utilities +
        maintenanceCosts +
        marketingCosts;

      // === PROFIT ===
      const netProfit = totalRevenue - totalExpenses;
      const newCash = prev.cash + netProfit;

      // === UPDATE BUSINESS METRICS ===
      let newSatisfaction = prev.customerSatisfaction;

      // Bean quality affects satisfaction
      if (decisions.beanQuality === 1) newSatisfaction -= 2;
      if (decisions.beanQuality === 3) newSatisfaction += 3;

      // Adequate staffing affects satisfaction
      const customersPerStaff = actualCustomers / newStaff;
      if (customersPerStaff > 1500) newSatisfaction -= 5; // Understaffed
      if (customersPerStaff < 800) newSatisfaction += 2; // Well-staffed

      // Equipment condition affects satisfaction
      if (prev.equipmentCondition < 50) newSatisfaction -= 8;
      else if (prev.equipmentCondition > 80) newSatisfaction += 2;

      // Price affects satisfaction
      if (decisions.coffeePrice > 5.5) newSatisfaction -= 3;
      if (decisions.coffeePrice < 3.5) newSatisfaction += 2;

      newSatisfaction = Math.max(20, Math.min(100, newSatisfaction));

      // Daily customers influenced by satisfaction and marketing
      let newDailyCustomers = prev.dailyCustomers;
      newDailyCustomers += (newSatisfaction - 75) * 0.2;
      newDailyCustomers += decisions.marketingSpend * 0.8;
      newDailyCustomers = Math.max(50, Math.min(250, newDailyCustomers));

      // Reputation
      let newReputation = prev.reputation;
      newReputation += (newSatisfaction - 75) * 0.1;
      if (decisions.beanQuality === 3) newReputation += 1;
      newReputation = Math.max(10, Math.min(100, newReputation));

      // Equipment degrades over time
      let newEquipmentCondition =
        prev.equipmentCondition - 2 + decisions.equipmentMaintenance;
      newEquipmentCondition = Math.max(0, Math.min(100, newEquipmentCondition));

      // === RANDOM EVENTS ===
      if (Math.random() < 0.15) {
        const event =
          randomEvents[Math.floor(Math.random() * randomEvents.length)];
        setGameLog((prevLog) => [
          ...prevLog.slice(-4),
          `Month ${prev.month}: ${event.text}`,
        ]);
        setCurrentEvent({ text: event.text, month: prev.month });

        // Play notification sound for all random events
        playSound('notification.mp3');

        // Apply event effects
        if (event.effect.dailyCustomers) {
          newDailyCustomers = Math.max(
            50,
            newDailyCustomers + event.effect.dailyCustomers
          );
        }
        if (event.effect.reputation) {
          newReputation = Math.max(
            10,
            Math.min(100, newReputation + event.effect.reputation)
          );
        }
        if (event.effect.customerSatisfaction) {
          newSatisfaction = Math.max(
            20,
            Math.min(100, newSatisfaction + event.effect.customerSatisfaction)
          );
        }
        if (event.effect.equipmentCondition) {
          newEquipmentCondition = Math.max(
            0,
            Math.min(
              100,
              newEquipmentCondition + event.effect.equipmentCondition
            )
          );
        }
        if (event.effect.coffeeBeans) {
          // Apply to remaining beans only
          remainingBeans = Math.max(
            0,
            remainingBeans + event.effect.coffeeBeans
          );
        }
      }

      // Final bounds checking
      newDailyCustomers = Math.max(50, Math.min(250, newDailyCustomers));
      newReputation = Math.max(10, Math.min(100, newReputation));
      newSatisfaction = Math.max(20, Math.min(100, newSatisfaction));

      // Debug logging
      console.log(`MONTH ${prev.month}:`);
      console.log(`  Starting beans: ${startingBeans}kg`);
      console.log(`  Beans ordered: ${decisions.beanOrders}kg`);
      console.log(`  Total available: ${totalBeans}kg`);
      console.log(`  Customers served: ${actualCustomers.toFixed(0)}`);
      console.log(`  Coffees sold: ${coffeesSold.toFixed(0)}`);
      console.log(`  Beans used: ${beansUsed.toFixed(1)}kg`);
      console.log(`  Beans remaining: ${remainingBeans.toFixed(1)}kg`);
      
      // Cash Flow Analysis
      const currentCashFlow = {
        month: prev.month,
        revenue: {
          coffeeRevenue: coffeeRevenue,
          coffeeSold: coffeesSold,
          coffeePrice: decisions.coffeePrice,
          pastryRevenue: pastryRevenue,
          pastrySold: pastriesSold,
          pastryPrice: decisions.pastryPrice,
          totalRevenue: totalRevenue
        },
        expenses: {
          beanCosts: beanCosts,
          beanOrders: decisions.beanOrders,
          beanCostPerKg: beanCostPerKg,
          staffCosts: staffCosts,
          staff: newStaff,
          pastryCosts: pastryCosts,
          pastryOrders: decisions.pastryOrders,
          rent: rent,
          utilities: utilities,
          maintenanceCosts: maintenanceCosts,
          marketingCosts: marketingCosts,
          totalExpenses: totalExpenses
        },
        netProfit: netProfit,
        cashBefore: prev.cash,
        cashAfter: newCash
      };
      
      setCashFlowData(currentCashFlow);
      
      console.log(`CASH FLOW ANALYSIS:`);
      console.log(`  REVENUE:`);
      console.log(`    Coffee sales: $${coffeeRevenue.toFixed(2)} (${coffeesSold.toFixed(0)} × $${decisions.coffeePrice})`);
      console.log(`    Pastry sales: $${pastryRevenue.toFixed(2)} (${pastriesSold.toFixed(0)} × $${decisions.pastryPrice})`);
      console.log(`    Total revenue: $${totalRevenue.toFixed(2)}`);
      console.log(`  EXPENSES:`);
      console.log(`    Bean costs: $${beanCosts.toFixed(2)} (${decisions.beanOrders}kg × $${beanCostPerKg})`);
      console.log(`    Staff costs: $${staffCosts.toFixed(2)} (${newStaff} × $2,800)`);
      console.log(`    Pastry costs: $${pastryCosts.toFixed(2)} (${decisions.pastryOrders} × $1.50)`);
      console.log(`    Rent: $${rent.toFixed(2)}`);
      console.log(`    Utilities: $${utilities.toFixed(2)}`);
      console.log(`    Maintenance: $${maintenanceCosts.toFixed(2)}`);
      console.log(`    Marketing: $${marketingCosts.toFixed(2)}`);
      console.log(`    Total expenses: $${totalExpenses.toFixed(2)}`);
      console.log(`  NET PROFIT: $${netProfit.toFixed(2)}`);
      console.log(`  CASH FLOW: $${prev.cash.toFixed(2)} → $${newCash.toFixed(2)} (${netProfit >= 0 ? '+' : ''}$${netProfit.toFixed(2)})`);

      const newState = {
        ...prev,
        cash: newCash,
        staff: newStaff,
        coffeeBeans: Math.max(0, remainingBeans),
        pastries: Math.max(0, remainingPastries),
        customerSatisfaction: newSatisfaction,
        dailyCustomers: newDailyCustomers,
        reputation: newReputation,
        month: prev.month + 1,
        revenue: totalRevenue,
        expenses: totalExpenses,
        netProfit,
        equipmentCondition: newEquipmentCondition,
      };

      // Play sounds based on game outcomes
      if (netProfit > 0) {
        playSound('cash-register.mp3');
      } else if (netProfit < 0) {
        playSound('coins.mp3');
      }

      if (newState.cash <= 0 || newState.month > 12) {
        setShowResults(true);
        if (newState.cash > 0) {
          playSound('victory.mp3');
        } else {
          playSound('sad-sound.mp3');
        }
      }

      return newState;
    });

    // Reset decisions for next month (preserve pricing)
    setDecisions((prev) => ({
      staffChanges: 0,
      coffeePrice: prev.coffeePrice, // Maintain current coffee price
      pastryPrice: prev.pastryPrice, // Maintain current pastry price
      beanQuality: 2,
      marketingSpend: 0,
      equipmentMaintenance: 0,
      pastryOrders: 0,
      beanOrders: 0,
    }));
  };

  const nextMonth = () => {
    if (gameState.month <= 12 && gameState.cash > 0 && !showResults) {
      processMonth();
    }
  };

  const getPerformanceColor = (value, good = 70) => {
    return value >= good
      ? "text-green-600"
      : value >= 50
      ? "text-yellow-600"
      : "text-red-600";
  };

  const getFinancialStatus = () => {
    if (gameState.cash > 40000)
      return { text: "Thriving", color: "text-green-600" };
    if (gameState.cash > 20000)
      return { text: "Profitable", color: "text-blue-600" };
    if (gameState.cash > 10000)
      return { text: "Stable", color: "text-yellow-600" };
    if (gameState.cash > 0)
      return { text: "Struggling", color: "text-orange-600" };
    return { text: "Closed", color: "text-red-600" };
  };

  const status = getFinancialStatus();

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-amber-50 to-orange-100 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Coffee className="text-amber-600" />☕ Coffee Shop Business
              Simulator
            </h1>
            <p className="text-gray-600 mt-2">
              Build and manage your neighborhood coffee shop over 12 months
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCashFlow(!showCashFlow)}
              className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
                showCashFlow
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-gray-300 hover:bg-gray-400 text-gray-700"
              }`}
            >
              <DollarSign size={20} />
              Cash Flow
            </button>
            <button
              onClick={nextMonth}
              disabled={
                gameState.month > 12 || gameState.cash <= 0 || showResults
              }
              className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
                gameState.month > 12 || gameState.cash <= 0 || showResults
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              <Play size={20} />
              Next Month ({gameState.month + 1})
            </button>
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              <RotateCcw size={20} />
              Reset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-amber-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="text-amber-600" size={20} />
              <span className="font-semibold text-gray-700">Cash</span>
            </div>
            <div className={`text-2xl font-bold ${status.color}`}>
              ${gameState.cash.toLocaleString()}
            </div>
            <div className={`text-sm ${status.color}`}>{status.text}</div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="text-blue-600" size={20} />
              <span className="font-semibold text-gray-700">Staff</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {gameState.staff}
            </div>
            <div className="text-sm text-gray-600">Employees</div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Package className="text-green-600" size={20} />
              <span className="font-semibold text-gray-700">Inventory</span>
            </div>
            <div className="text-lg font-bold text-gray-800">
              {gameState.coffeeBeans.toFixed(1)}kg beans
            </div>
            <div className="text-sm text-gray-600">
              {gameState.pastries} pastries
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <ThermometerSun className="text-purple-600" size={20} />
              <span className="font-semibold text-gray-700">Month</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {gameState.month}/12
            </div>
            <div className="text-sm text-gray-600">Progress</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Daily Customers</div>
            <div
              className={`text-xl font-bold ${getPerformanceColor(
                gameState.dailyCustomers,
                100
              )}`}
            >
              {gameState.dailyCustomers.toFixed(0)}
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Satisfaction</div>
            <div
              className={`text-xl font-bold ${getPerformanceColor(
                gameState.customerSatisfaction,
                75
              )}`}
            >
              {gameState.customerSatisfaction.toFixed(0)}%
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Reputation</div>
            <div
              className={`text-xl font-bold ${getPerformanceColor(
                gameState.reputation,
                75
              )}`}
            >
              {gameState.reputation.toFixed(0)}%
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Revenue</div>
            <div className="text-lg font-bold text-green-600">
              ${gameState.revenue.toLocaleString()}
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Net Profit</div>
            <div
              className={`text-lg font-bold ${
                gameState.netProfit >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              ${gameState.netProfit.toLocaleString()}
            </div>
          </div>
        </div>

        {showCashFlow && cashFlowData && (
          <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-lg mb-6">
            <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
              <DollarSign className="text-blue-600" size={24} />
              Cash Flow Analysis - Month {cashFlowData.month}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Revenue Section */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-green-800 mb-3">Revenue</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Coffee Sales ({cashFlowData.revenue.coffeeSold.toFixed(0)} × ${cashFlowData.revenue.coffeePrice.toFixed(2)}):</span>
                    <span className="font-bold text-green-700">${cashFlowData.revenue.coffeeRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pastry Sales ({cashFlowData.revenue.pastrySold.toFixed(0)} × ${cashFlowData.revenue.pastryPrice.toFixed(2)}):</span>
                    <span className="font-bold text-green-700">${cashFlowData.revenue.pastryRevenue.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-green-200 pt-2 mt-2">
                    <div className="flex justify-between font-bold text-green-800">
                      <span>Total Revenue:</span>
                      <span>${cashFlowData.revenue.totalRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expenses Section */}
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-red-800 mb-3">Expenses</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Beans ({cashFlowData.expenses.beanOrders}kg × ${cashFlowData.expenses.beanCostPerKg}):</span>
                    <span className="font-bold text-red-700">${cashFlowData.expenses.beanCosts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Staff ({cashFlowData.expenses.staff} × $700):</span>
                    <span className="font-bold text-red-700">${cashFlowData.expenses.staffCosts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pastries ({cashFlowData.expenses.pastryOrders} × $1.50):</span>
                    <span className="font-bold text-red-700">${cashFlowData.expenses.pastryCosts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rent:</span>
                    <span className="font-bold text-red-700">${cashFlowData.expenses.rent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Utilities:</span>
                    <span className="font-bold text-red-700">${cashFlowData.expenses.utilities.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Maintenance:</span>
                    <span className="font-bold text-red-700">${cashFlowData.expenses.maintenanceCosts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Marketing:</span>
                    <span className="font-bold text-red-700">${cashFlowData.expenses.marketingCosts.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-red-200 pt-2 mt-2">
                    <div className="flex justify-between font-bold text-red-800">
                      <span>Total Expenses:</span>
                      <span>${cashFlowData.expenses.totalExpenses.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Profit and Cash Flow Summary */}
            <div className="mt-4 p-4 bg-white rounded-lg border-2 border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Net Profit</div>
                  <div className={`text-2xl font-bold ${cashFlowData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {cashFlowData.netProfit >= 0 ? '+' : ''}${cashFlowData.netProfit.toLocaleString()}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Cash Flow</div>
                  <div className="text-lg font-semibold text-gray-800">
                    ${cashFlowData.cashBefore.toLocaleString()} → ${cashFlowData.cashAfter.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentEvent && (
          <div className="bg-red-50 border-2 border-red-200 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <h3 className="font-bold text-red-800 text-lg">
                ⚠️ Breaking News - Month {currentEvent.month}
              </h3>
            </div>
            <p className="text-red-700 font-semibold text-lg">
              {currentEvent.text}
            </p>
            <p className="text-red-600 text-sm mt-1">
              This event may affect your business performance this month.
            </p>
          </div>
        )}

        <div className="bg-indigo-50 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-700">
              Equipment Condition
            </span>
            <span
              className={`font-bold ${getPerformanceColor(
                gameState.equipmentCondition,
                70
              )}`}
            >
              {gameState.equipmentCondition.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
            <div
              className={`h-3 rounded-full transition-all ${
                gameState.equipmentCondition >= 70
                  ? "bg-green-500"
                  : gameState.equipmentCondition >= 50
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${gameState.equipmentCondition}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Poor equipment slows service and reduces customer satisfaction
          </div>
        </div>

        <div className="bg-orange-50 p-6 rounded-lg mb-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">
            Monthly Business Decisions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Staff Changes ({decisions.staffChanges > 0 ? "+" : ""}
                {decisions.staffChanges})
              </label>
              <input
                type="range"
                min="-2"
                max="3"
                value={decisions.staffChanges}
                onChange={(e) =>
                  setDecisions((prev) => ({
                    ...prev,
                    staffChanges: parseInt(e.target.value),
                  }))
                }
                className="w-full"
              />
              <div className="text-xs text-gray-600 mt-1">
                Salary: $700/month per person
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Coffee Price (${decisions.coffeePrice.toFixed(2)})
              </label>
              <input
                type="range"
                min="3.00"
                max="6.50"
                step="0.25"
                value={decisions.coffeePrice}
                onChange={(e) =>
                  setDecisions((prev) => ({
                    ...prev,
                    coffeePrice: parseFloat(e.target.value),
                  }))
                }
                className="w-full"
              />
              <div className="text-xs text-gray-600 mt-1">
                Average market price: $4.25
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Pastry Price (${decisions.pastryPrice.toFixed(2)})
              </label>
              <input
                type="range"
                min="2.00"
                max="4.50"
                step="0.25"
                value={decisions.pastryPrice}
                onChange={(e) =>
                  setDecisions((prev) => ({
                    ...prev,
                    pastryPrice: parseFloat(e.target.value),
                  }))
                }
                className="w-full"
              />
              <div className="text-xs text-gray-600 mt-1">
                Average market price: $2.75
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bean Quality ({getBeanQualityName(decisions.beanQuality)})
              </label>
              <input
                type="range"
                min="1"
                max="3"
                value={decisions.beanQuality}
                onChange={(e) =>
                  setDecisions((prev) => ({
                    ...prev,
                    beanQuality: parseInt(e.target.value),
                  }))
                }
                className="w-full"
              />
              <div className="text-xs text-gray-600 mt-1">
                Higher quality = better taste, higher cost
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Marketing Budget (${decisions.marketingSpend * 100})
              </label>
              <input
                type="range"
                min="0"
                max="20"
                value={decisions.marketingSpend}
                onChange={(e) =>
                  setDecisions((prev) => ({
                    ...prev,
                    marketingSpend: parseInt(e.target.value),
                  }))
                }
                className="w-full"
              />
              <div className="text-xs text-gray-600 mt-1">
                Attracts new customers
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Equipment Maintenance (${decisions.equipmentMaintenance * 50})
              </label>
              <input
                type="range"
                min="0"
                max="15"
                value={decisions.equipmentMaintenance}
                onChange={(e) =>
                  setDecisions((prev) => ({
                    ...prev,
                    equipmentMaintenance: parseInt(e.target.value),
                  }))
                }
                className="w-full"
              />
              <div className="text-xs text-gray-600 mt-1">
                Keeps equipment in good condition
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Order Pastries ({decisions.pastryOrders} units)
              </label>
              <input
                type="range"
                min="0"
                max="1800"
                value={decisions.pastryOrders}
                onChange={(e) =>
                  setDecisions((prev) => ({
                    ...prev,
                    pastryOrders: parseInt(e.target.value),
                  }))
                }
                className="w-full"
              />
              <div className="text-xs text-gray-600 mt-1">
                Cost: $1.50 each to buy
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Order Coffee Beans ({decisions.beanOrders}kg)
              </label>
              <input
                type="range"
                min="0"
                max="400"
                value={decisions.beanOrders}
                onChange={(e) =>
                  setDecisions((prev) => ({
                    ...prev,
                    beanOrders: parseInt(e.target.value),
                  }))
                }
                className="w-full"
              />
              <div className="text-xs text-gray-600 mt-1">
                Cost: $
                {decisions.beanQuality === 1
                  ? 12
                  : decisions.beanQuality === 2
                  ? 18
                  : 28}
                /kg
              </div>
            </div>
          </div>
        </div>

        {gameLog.length > 0 && (
          <div className="bg-yellow-50 p-4 rounded-lg mb-6">
            <h3 className="font-bold text-gray-800 mb-2">
              ☕ Coffee Shop News
            </h3>
            <div className="space-y-1">
              {gameLog.map((event, index) => (
                <div key={index} className="text-sm text-gray-700">
                  {event}
                </div>
              ))}
            </div>
          </div>
        )}

        {showResults && (
          <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-lg">
            <h3 className="text-2xl font-bold text-center mb-4 text-gray-800">
              {gameState.cash > 0
                ? "🎉 Coffee Shop Success!"
                : "☕ Shop Closed!"}
            </h3>
            <div className="text-center space-y-2">
              <p className="text-lg">
                {gameState.cash > 0
                  ? `Great job! Your coffee shop finished with $${gameState.cash.toLocaleString()}`
                  : "Your coffee shop ran out of money. Time to learn from this experience!"}
              </p>
              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <div>
                  Final Cash:{" "}
                  <span className="font-bold">
                    ${gameState.cash.toLocaleString()}
                  </span>
                </div>
                <div>
                  Staff: <span className="font-bold">{gameState.staff}</span>
                </div>
                <div>
                  Daily Customers:{" "}
                  <span className="font-bold">
                    {gameState.dailyCustomers.toFixed(0)}
                  </span>
                </div>
                <div>
                  Customer Satisfaction:{" "}
                  <span className="font-bold">
                    {gameState.customerSatisfaction.toFixed(0)}%
                  </span>
                </div>
                <div>
                  Reputation:{" "}
                  <span className="font-bold">
                    {gameState.reputation.toFixed(0)}%
                  </span>
                </div>
                <div>
                  Equipment Condition:{" "}
                  <span className="font-bold">
                    {gameState.equipmentCondition.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-amber-50 p-4 rounded-lg mt-6">
          <h3 className="font-bold text-gray-800 mb-2">
            ☕ How to Run Your Coffee Shop
          </h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p>
              • <strong>Goal:</strong> Keep your coffee shop profitable for 12
              months
            </p>
            <p>
              • <strong>Key decisions:</strong> Pricing, staffing, quality,
              marketing, and maintenance
            </p>
            <p>
              • <strong>Fixed costs:</strong> Rent ($2,000), utilities ($450),
              staff salaries
            </p>
            <p>
              • <strong>Inventory:</strong> Each kg of beans makes 10 cups.
              Default: 50kg beans ordered per month
            </p>
            <p>
              • <strong>Customers:</strong> ~70% buy coffee, ~30% buy pastries
            </p>
            <p>
              • <strong>Equipment matters:</strong> Poor equipment reduces
              customer satisfaction
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoffeeShopSimulation;
