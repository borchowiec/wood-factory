# Wood Factory - Mobile Game

**Wood Factory** is a mobile strategy and production management game where players build and automate wood processing
processes. Focus on producing complex items and optimizing production workflows to scale up your factory from simple
planks to advanced ships.

## Features

- Crafting system with increasingly complex production chains
- Automation with conveyors, sorters, splitters, and storage units
- Economy with scalable production and selling prices
- Upgrade system with purchasable workshops and factories
- Built using **React** and **Phaser.js**

## Screenshots

| ![Screen Shot 2025-01-13 at 23.24.30.png](docs/Screen%20Shot%202025-01-13%20at%2023.24.30.png) | ![Screen Shot 2025-01-13 at 23.24.41.png](docs/Screen%20Shot%202025-01-13%20at%2023.24.41.png)   | ![Screen Shot 2025-01-13 at 23.25.08.png](docs/Screen%20Shot%202025-01-13%20at%2023.25.08.png)   |
|------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| ![Screen Shot 2025-01-13 at 23.25.29.png](docs/Screen%20Shot%202025-01-13%20at%2023.25.29.png) | ![Screen Shot 2025-01-13 at 23.25.53.png](docs/Screen%20Shot%202025-01-13%20at%2023.25.53.png)   | ![Screen Shot 2025-01-13 at 23.34.55.png](docs%2FScreen%20Shot%202025-01-13%20at%2023.34.55.png) |
|                                                                                                | ![Screen Shot 2025-01-13 at 23.35.20.png](docs%2FScreen%20Shot%202025-01-13%20at%2023.35.20.png) |                                                                                                  |

## Production Paths

```
Log → Saw Mill → Plank
Log → Workshop → Bar

Plank → Wooden Nails Workshop → 2 Wooden Nails
Plank → Paper Workshop → 3 Sheets of Paper
4 Sheets of Paper → Fabric Factory → Cloth

2 Bars + 3 Cloths → Sail Factory → Sail

2 Planks + 6 Wooden Nails → Chair Factory → Chair
6 Planks + 10 Wooden Nails → Table Factory → Table
10 Planks + 1 Log + 4 Nails → Sculpting Workshop → Sculpture

20 Planks + 50 Wooden Nails → Boat Factory → Boat
Boat + 10 Planks + 50 Wooden Nails + 1 Sail → Sailboat Factory → Simple Sailboat
Simple Sailboat + 8 Chairs + 4 Tables + 5 Planks + 10 Wooden Nails → Sailboat Workshop → Big Sailboat
Big Sailboat + 10 Planks + 20 Wooden Nails + 2 Sculptures → Ship Workshop → Ship
```

## Sell Prices

- Log: 10
- Plank: 25
- Bar: 25
- Nail: 7
- Sheet of Paper: 10
- Cloth: 50
- Sail: 100
- Chair: 75
- Table: 150
- Sculpture: 200
- Boat: 400
- Simple Sailboat: 700
- Big Sailboat: 1,200
- Ship: 2,500

## Buy Prices

- **Saw Mill**: 500 coins
- **Workshop**: 750 coins
- **Wooden Nails Workshop**: 1,200 coins
- **Paper Workshop**: 1,800 coins
- **Fabric Factory**: 2,500 coins
- **Sail Factory**: 3,500 coins
- **Chair Factory**: 4,500 coins
- **Table Factory**: 6,000 coins
- **Sculpting Workshop**: 8,000 coins
- **Boat Factory**: 10,500 coins
- **Sailboat Factory**: 14,000 coins
- **Sailboat Workshop**: 18,000 coins
- **Ship Workshop**: 50,000 coins
- **Log Producer**: 5,000 coins
- **Conveyor Belt**: 100 coins
- **Turned Conveyor Belt**: 100 coins
- **Sorter**: 500 coins
- **Splitter**: 500 coins
- **Merger**: 500 coins
- **Storage**: 1,500 coins

## How to

Install

```
npm install
```

Serve locally

```
ionic serve
```

Build apk

```
./scripts/build.sh
```