# Blood Bank Management System (DSA-Powered)

An end-to-end Blood Bank Management System implemented in **C++** using custom, pointer-based **Data Structures & Algorithms (DSA)** built from scratch without standard STL containers for core DSA mechanics.

---

## 1. Problem Statement & Real-World Domain
A blood bank must manage two dynamic streams of data under high medical stakes:
1. **Supply**: Donors who contribute blood units, which expire within ~42 days.
2. **Demand**: Patients requiring blood with varying degrees of emergency (Trauma/ICU vs Routine surgeries).

To operate reliably, the system must guarantee:
- Fast logarithmic search and sorted retrieval of donor medical records.
- Strict **First-In First-Out (FIFO)** shelf-life inventory management so the oldest units are dispensed before expiring.
- **Priority-based triage** so critical trauma patients are treated before routine requests regardless of arrival time.
- **Medical compatibility matching** (e.g. O- universal donor fallback).

---

## 2. DSA Architecture & Complexity Analysis

| Component | DSA Chosen | Motivation & Real-World Justification | Time Complexity | Space Complexity |
|---|---|---|---|---|
| **Donor Database** | **Custom Binary Search Tree (BST)** | Fast lookup by unique Donor ID; in-order traversal produces natural sorted donor directory | Search: $O(\log N)$<br>Insert: $O(\log N)$<br>Delete: $O(\log N)$ | $O(N)$ |
| **Blood Stock Inventory** | **Array of 8 Custom FIFO Queues** | 8 queues (one per blood group: A+, A-, B+, B-, AB+, AB-, O+, O-). Guarantees the oldest collected unit is always dispensed first to eliminate expiry waste | Enqueue: $O(1)$<br>Dequeue: $O(1)$<br>Peek: $O(1)$ | $O(K)$ ($K$ = units) |
| **Emergency Triage** | **Custom Max-Heap (Priority Queue)** | Prioritizes requests by medical urgency: Critical (Level 3) > Urgent (Level 2) > Routine (Level 1). Arrival timestamp acts as tie-breaker | Insert: $O(\log M)$<br>Extract-Max: $O(\log M)$<br>Peek: $O(1)$ | $O(M)$ ($M$ = requests) |
| **Smart Matching** | **Compatibility Matrix & Rules** | Exact match first; gracefully falls back to universal donors (e.g., O-) when exact match is depleted | $O(1)$ | $O(1)$ |

---

## 3. Project Structure

```text
d:\Dsa Project\
├── GATES.md               # Unlazy verification gates ledger
├── README.md              # Project documentation and DSA breakdown
├── include/
│   ├── Models.hpp         # Donor, BloodUnit, BloodRequest structs & enums
│   ├── BST.hpp            # Custom Binary Search Tree from scratch
│   ├── Queue.hpp          # Custom FIFO Linked-List Queue from scratch
│   ├── PriorityQueue.hpp  # Custom Max-Heap Priority Queue from scratch
│   ├── Compatibility.hpp  # Blood compatibility rules & matching
│   └── BloodBank.hpp      # Orchestrator & Business Logic header
├── src/
│   ├── BloodBank.cpp      # BloodBankManager implementation & CSV I/O
│   └── main.cpp           # Interactive ANSI Colored CLI Menu application
├── tests/
│   └── test_runner.cpp    # Automated unit and integration test suite
├── data/
│   ├── donors.csv         # Persistent donor records
│   └── stock.csv          # Persistent blood units stock
└── bin/
    ├── bloodbank.exe      # Compiled main CLI executable
    └── test_dsa.exe       # Compiled test runner executable
```

---

## 4. How to Build & Run

### Prerequisites
- Windows with `g++` (MinGW) supporting C++11 / C++14.

### Compilation
Open PowerShell in the project directory:

```powershell
# Compile the main application
g++ -std=c++14 -Iinclude src/main.cpp src/BloodBank.cpp -o bin/bloodbank.exe

# Compile the automated test runner
g++ -std=c++14 -Iinclude tests/test_runner.cpp src/BloodBank.cpp -o bin/test_dsa.exe
```

### Running the Interactive Console CLI
```powershell
.\bin\bloodbank.exe

# Or run the non-interactive automated test suite:
.\bin\bloodbank.exe --test
```

### Running the Web Dashboard (100% Screen Width Clinical Console)
```powershell
# 1. Start the local bridge API & web server:
node server.js

# 2. Open in your browser:
# http://localhost:5000

# (Optional) For live development with Vite:
cd ui
npm run dev
# Open http://localhost:5173
```

---

## 5. Verification Gates Ledger (`GATES.md`)

All nine verification gates pass with 100% evidence:
- **G1**: Custom Binary Search Tree (Insert, Search, Deletion, In-order sorted traversal) -> `[PASS]`
- **G2**: Custom FIFO Blood Queue (Enqueue, Dequeue order, FIFO integrity) -> `[PASS]`
- **G3**: Custom Max-Heap Priority Queue (Emergency triage order, timestamp tie-breaking) -> `[PASS]`
- **G4**: Smart Compatibility Matching & Fulfillment -> `[PASS]`
- **G5**: File Persistence & Reloading Integrity -> `[PASS]`
- **G6**: End-to-End Build & Automated Suite Verification -> `[PASS]`
- **G7**: Full-Width Clinical Web UI Production Build -> `[PASS]`
- **G8**: Local Bridge API Operations Verification -> `[PASS]`
- **G9**: Negative Constraint Audit (Zero Occurrences of Banned Word) -> `[PASS]`
