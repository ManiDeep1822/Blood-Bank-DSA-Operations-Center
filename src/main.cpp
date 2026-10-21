#include "BloodBank.hpp"
#include <iostream>
#include <iomanip>
#include <string>
#include <limits>

// ANSI Color Codes for terminal UI
namespace Color {
    const std::string RESET   = "\033[0m";
    const std::string RED     = "\033[31m";
    const std::string GREEN   = "\033[32m";
    const std::string YELLOW  = "\033[33m";
    const std::string BLUE    = "\033[34m";
    const std::string MAGENTA = "\033[35m";
    const std::string CYAN    = "\033[36m";
    const std::string BOLD    = "\033[1m";
}

void clearInputBuffer() {
    std::cin.clear();
    std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
}

void pause() {
    std::cout << "\n" << Color::CYAN << "Press Enter to return to menu..." << Color::RESET;
    std::cin.get();
}

void printBanner() {
    std::cout << Color::RED << Color::BOLD;
    std::cout << "========================================================================\n";
    std::cout << "          BLOOD BANK MANAGEMENT SYSTEM (DSA POWERED)                   \n";
    std::cout << "========================================================================\n";
    std::cout << Color::RESET;
    std::cout << Color::YELLOW << " [DSA Components]: BST (Donors) | 8 FIFO Queues (Stock) | Max-Heap (Triage)\n" << Color::RESET;
    std::cout << "------------------------------------------------------------------------\n";
}

void displayMenu() {
    std::cout << Color::BOLD << "\n--- MAIN CONTROL PANEL ---\n" << Color::RESET;
    std::cout << " 1. " << Color::GREEN   << "Register New Donor" << Color::RESET << "           [Insert into BST]\n";
    std::cout << " 2. " << Color::GREEN   << "Search Donor by ID" << Color::RESET << "           [O(log N) BST Search]\n";
    std::cout << " 3. " << Color::GREEN   << "List All Donors" << Color::RESET << "              [In-Order BST Traversal]\n";
    std::cout << " 4. " << Color::RED     << "Record Blood Donation" << Color::RESET << "        [Enqueue to FIFO Stock Queue]\n";
    std::cout << " 5. " << Color::RED     << "View Blood Stock Inventory" << Color::RESET << "   [8 Group Queue Summary]\n";
    std::cout << " 6. " << Color::RED     << "Inspect Group FIFO Units" << Color::RESET << "     [Inspect Oldest-to-Newest Units]\n";
    std::cout << " 7. " << Color::YELLOW  << "Submit Patient Request" << Color::RESET << "       [Push to Max-Heap Priority Queue]\n";
    std::cout << " 8. " << Color::YELLOW  << "View Pending Requests" << Color::RESET << "        [Heap-Sorted Triage View]\n";
    std::cout << " 9. " << Color::MAGENTA << "Fulfill Priority Request" << Color::RESET << "     [Pop Max-Heap + Smart FIFO Dispense]\n";
    std::cout << "10. View Audit / Dispense Log\n";
    std::cout << "11. Run Automated DSA Self-Test Suite\n";
    std::cout << "12. Save Data & Exit\n";
    std::cout << Color::BOLD << "Enter your choice (1-12): " << Color::RESET;
}

void handleRegisterDonor(BloodBankManager& bank) {
    std::cout << "\n" << Color::BOLD << "--- REGISTER NEW DONOR ---" << Color::RESET << "\n";
    std::string name, gender, bloodGroupStr, phone;
    int age;

    std::cout << "Enter Donor Full Name: ";
    std::getline(std::cin, name);

    std::cout << "Enter Age (18-65): ";
    while (!(std::cin >> age)) {
        std::cout << "Invalid number. Enter Age: ";
        clearInputBuffer();
    }
    clearInputBuffer();

    std::cout << "Enter Gender (Male/Female/Other): ";
    std::getline(std::cin, gender);

    std::cout << "Enter Blood Group (A+, A-, B+, B-, AB+, AB-, O+, O-): ";
    std::getline(std::cin, bloodGroupStr);

    BloodGroup bg = stringToBloodGroup(bloodGroupStr);
    if (bg == UNKNOWN_GROUP) {
        std::cout << Color::RED << "Error: Invalid blood group entered!\n" << Color::RESET;
        pause();
        return;
    }

    std::cout << "Enter Contact Phone Number: ";
    std::getline(std::cin, phone);

    std::string errorMsg;
    bool success = bank.registerDonor(name, age, gender, bg, phone, errorMsg);

    if (success) {
        std::cout << Color::GREEN << "\n[SUCCESS] Donor successfully registered in the Binary Search Tree!" << Color::RESET << "\n";
    } else {
        std::cout << Color::RED << "\n[FAILED] " << errorMsg << Color::RESET << "\n";
    }
    pause();
}

void handleSearchDonor(BloodBankManager& bank) {
    std::cout << "\n" << Color::BOLD << "--- SEARCH DONOR BY ID (BST) ---" << Color::RESET << "\n";
    std::cout << "Enter Donor ID: ";
    int id;
    if (!(std::cin >> id)) {
        clearInputBuffer();
        std::cout << Color::RED << "Invalid input.\n" << Color::RESET;
        pause();
        return;
    }
    clearInputBuffer();

    Donor* d = bank.findDonor(id);
    if (d) {
        std::cout << Color::GREEN << "\n[DONOR FOUND in BST]:\n" << Color::RESET;
        std::cout << "  ID:            " << d->id << "\n";
        std::cout << "  Name:          " << d->name << "\n";
        std::cout << "  Age / Gender:  " << d->age << " / " << d->gender << "\n";
        std::cout << "  Blood Group:   " << Color::RED << bloodGroupToString(d->bloodGroup) << Color::RESET << "\n";
        std::cout << "  Contact:       " << d->contact << "\n";
        std::cout << "  Last Donated:  " << d->lastDonationDate << "\n";
    } else {
        std::cout << Color::RED << "\n[NOT FOUND] No donor found with ID " << id << ".\n" << Color::RESET;
    }
    pause();
}

void handleListDonors(BloodBankManager& bank) {
    std::cout << "\n" << Color::BOLD << "--- ALL REGISTERED DONORS (Sorted by ID via BST In-Order) ---" << Color::RESET << "\n";
    std::vector<Donor> list = bank.listAllDonors();

    if (list.empty()) {
        std::cout << "No donors currently registered.\n";
        pause();
        return;
    }

    std::cout << "--------------------------------------------------------------------------------------\n";
    std::cout << std::left << std::setw(6)  << "ID"
              << std::setw(22) << "Name"
              << std::setw(6)  << "Age"
              << std::setw(8)  << "Gender"
              << std::setw(10) << "Group"
              << std::setw(16) << "Contact"
              << std::setw(14) << "Last Donation" << "\n";
    std::cout << "--------------------------------------------------------------------------------------\n";

    for (const auto& d : list) {
        std::cout << std::left << std::setw(6)  << d.id
                  << std::setw(22) << d.name
                  << std::setw(6)  << d.age
                  << std::setw(8)  << d.gender
                  << std::setw(10) << bloodGroupToString(d.bloodGroup)
                  << std::setw(16) << d.contact
                  << std::setw(14) << d.lastDonationDate << "\n";
    }
    std::cout << "--------------------------------------------------------------------------------------\n";
    std::cout << "Total Donors in BST: " << list.size() << "\n";
    pause();
}

void handleRecordDonation(BloodBankManager& bank) {
    std::cout << "\n" << Color::BOLD << "--- RECORD BLOOD DONATION ---" << Color::RESET << "\n";
    std::cout << "Enter Donor ID: ";
    int id;
    if (!(std::cin >> id)) {
        clearInputBuffer();
        std::cout << Color::RED << "Invalid input.\n" << Color::RESET;
        pause();
        return;
    }
    clearInputBuffer();

    Donor* d = bank.findDonor(id);
    if (!d) {
        std::cout << Color::RED << "Donor ID " << id << " does not exist! Please register donor first.\n" << Color::RESET;
        pause();
        return;
    }

    std::string date;
    std::cout << "Enter Collection Date (YYYY-MM-DD) [or press Enter for today: 2026-10-12]: ";
    std::getline(std::cin, date);
    if (date.empty()) date = "2026-10-12";

    int unitId = 0;
    std::string errMsg;
    if (bank.recordDonation(id, date, unitId, errMsg)) {
        std::cout << Color::GREEN << "\n[SUCCESS] Donation recorded!\n";
        std::cout << "  - Generated Unit ID: #" << unitId << "\n";
        std::cout << "  - Blood Group:       " << bloodGroupToString(d->bloodGroup) << "\n";
        std::cout << "  - Enqueued into:     FIFO Stock Queue for " << bloodGroupToString(d->bloodGroup) << "\n";
        std::cout << Color::RESET;
    } else {
        std::cout << Color::RED << "\n[FAILED] " << errMsg << Color::RESET << "\n";
    }
    pause();
}

void handleViewStock(BloodBankManager& bank) {
    std::cout << "\n" << Color::BOLD << "--- BLOOD STOCK INVENTORY SUMMARY (8 Queues) ---" << Color::RESET << "\n";
    std::cout << "------------------------------------------------------------\n";
    std::cout << std::left << std::setw(14) << "Blood Group"
              << std::setw(16) << "Available Units"
              << std::setw(20) << "Stock Status"
              << std::setw(10) << "Oldest Unit ID\n";
    std::cout << "------------------------------------------------------------\n";

    BloodGroup groups[] = {A_POS, A_NEG, B_POS, B_NEG, AB_POS, AB_NEG, O_POS, O_NEG};
    for (int i = 0; i < 8; i++) {
        BloodGroup bg = groups[i];
        int count = bank.getStockCount(bg);
        std::vector<BloodUnit> units = bank.getUnitsForGroup(bg);
        std::string status = (count == 0) ? (Color::RED + "OUT OF STOCK" + Color::RESET)
                           : (count < 2)  ? (Color::YELLOW + "LOW STOCK" + Color::RESET)
                                          : (Color::GREEN + "SUFFICIENT" + Color::RESET);
        std::string oldestId = (units.empty()) ? "None" : ("#" + std::to_string(units.front().unitId));

        std::cout << std::left << std::setw(14) << bloodGroupToString(bg)
                  << std::setw(16) << count
                  << std::setw(30) << status
                  << std::setw(10) << oldestId << "\n";
    }
    std::cout << "------------------------------------------------------------\n";
    std::cout << "Total Units across all 8 Queues: " << bank.getTotalStockCount() << "\n";
    pause();
}

void handleInspectGroup(BloodBankManager& bank) {
    std::cout << "\n" << Color::BOLD << "--- INSPECT BLOOD UNITS IN QUEUE ---" << Color::RESET << "\n";
    std::cout << "Enter Blood Group to inspect (A+, A-, B+, B-, AB+, AB-, O+, O-): ";
    std::string bgStr;
    std::getline(std::cin, bgStr);

    BloodGroup bg = stringToBloodGroup(bgStr);
    if (bg == UNKNOWN_GROUP) {
        std::cout << Color::RED << "Invalid blood group.\n" << Color::RESET;
        pause();
        return;
    }

    std::vector<BloodUnit> units = bank.getUnitsForGroup(bg);
    std::cout << "\nUnits in FIFO Queue for " << bloodGroupToString(bg) << " (" << units.size() << " units):\n";
    if (units.empty()) {
        std::cout << "Queue is empty.\n";
    } else {
        std::cout << "--------------------------------------------------------------------\n";
        std::cout << std::left << std::setw(10) << "Position"
                  << std::setw(12) << "Unit ID"
                  << std::setw(12) << "Donor ID"
                  << std::setw(16) << "Collected"
                  << std::setw(16) << "Expires" << "\n";
        std::cout << "--------------------------------------------------------------------\n";
        for (size_t i = 0; i < units.size(); i++) {
            std::string pos = (i == 0) ? "[FRONT/NEXT]" : ("#" + std::to_string(i + 1));
            std::cout << std::left << std::setw(10) << pos
                      << std::setw(12) << units[i].unitId
                      << std::setw(12) << units[i].donorId
                      << std::setw(16) << units[i].collectionDate
                      << std::setw(16) << units[i].expiryDate << "\n";
        }
    }
    pause();
}

void handleSubmitRequest(BloodBankManager& bank) {
    std::cout << "\n" << Color::BOLD << "--- SUBMIT PATIENT BLOOD REQUEST ---" << Color::RESET << "\n";
    std::string patientName, bgStr;
    int units, urgChoice;

    std::cout << "Enter Patient Name: ";
    std::getline(std::cin, patientName);

    std::cout << "Enter Blood Group Needed: ";
    std::getline(std::cin, bgStr);
    BloodGroup bg = stringToBloodGroup(bgStr);
    if (bg == UNKNOWN_GROUP) {
        std::cout << Color::RED << "Invalid blood group.\n" << Color::RESET;
        pause();
        return;
    }

    std::cout << "Enter Number of Units Needed: ";
    while (!(std::cin >> units) || units <= 0) {
        std::cout << "Invalid number. Enter Units: ";
        clearInputBuffer();
    }
    clearInputBuffer();

    std::cout << "Select Urgency Level:\n";
    std::cout << "  1. Routine (Planned surgery / non-emergency)\n";
    std::cout << "  2. Urgent (Surgery within 24h / Severe anemia)\n";
    std::cout << "  3. Critical / Emergency (Trauma / ICU / Active hemorrhage)\n";
    std::cout << "Choice (1-3): ";
    while (!(std::cin >> urgChoice) || urgChoice < 1 || urgChoice > 3) {
        std::cout << "Choose 1, 2, or 3: ";
        clearInputBuffer();
    }
    clearInputBuffer();

    UrgencyLevel urgency = static_cast<UrgencyLevel>(urgChoice);
    int reqId = bank.submitRequest(patientName, bg, units, urgency);

    std::cout << Color::GREEN << "\n[SUCCESS] Request #" << reqId
              << " registered and queued into Max-Heap Priority Queue!" << Color::RESET << "\n";
    std::cout << "Triage Priority Assigned: " << urgencyToString(urgency) << "\n";
    pause();
}

void handleViewRequests(BloodBankManager& bank) {
    std::cout << "\n" << Color::BOLD << "--- PENDING BLOOD REQUESTS (Max-Heap Order) ---" << Color::RESET << "\n";
    std::vector<BloodRequest> list = bank.getPendingRequests();

    if (list.empty()) {
        std::cout << "No pending requests in queue.\n";
        pause();
        return;
    }

    std::cout << "----------------------------------------------------------------------------------------\n";
    std::cout << std::left << std::setw(8)  << "Req ID"
              << std::setw(20) << "Patient"
              << std::setw(8)  << "Group"
              << std::setw(8)  << "Units"
              << std::setw(32) << "Triage Priority"
              << std::setw(10) << "Status" << "\n";
    std::cout << "----------------------------------------------------------------------------------------\n";

    for (const auto& r : list) {
        std::cout << std::left << std::setw(8)  << r.requestId
                  << std::setw(20) << r.patientName
                  << std::setw(8)  << bloodGroupToString(r.bloodGroupNeeded)
                  << std::setw(8)  << r.unitsNeeded
                  << std::setw(32) << urgencyToString(r.urgency)
                  << std::setw(10) << r.status << "\n";
    }
    std::cout << "----------------------------------------------------------------------------------------\n";
    std::cout << "Total Pending Requests in Heap: " << list.size() << "\n";
    pause();
}

void handleFulfillRequest(BloodBankManager& bank) {
    std::cout << "\n" << Color::BOLD << "--- FULFILL HIGHEST-PRIORITY REQUEST ---" << Color::RESET << "\n";
    std::string report;
    bool result = bank.fulfillNextRequest(report, true);

    if (result) {
        std::cout << Color::GREEN << report << Color::RESET << "\n";
    } else {
        std::cout << Color::YELLOW << report << Color::RESET << "\n";
    }
    pause();
}

void handleViewAuditLog(BloodBankManager& bank) {
    std::cout << "\n" << Color::BOLD << "--- AUDIT & DISPENSE LOG ---" << Color::RESET << "\n";
    const auto& log = bank.getAuditLog();
    if (log.empty()) {
        std::cout << "No audit events logged yet.\n";
    } else {
        for (size_t i = 0; i < log.size(); i++) {
            std::cout << " [" << (i + 1) << "] " << log[i] << "\n";
        }
    }
    pause();
}

void handleRunTests(bool interactive = true) {
    std::cout << "\n" << Color::BOLD << "--- RUNNING AUTOMATED DSA VERIFICATION ---" << Color::RESET << "\n";
    // Inline self-test suite
    std::cout << "[1/5] Testing Custom Binary Search Tree (BST)... ";
    DonorBST bst;
    bst.insert(Donor(10, "TestA", 30, "M", A_POS, "1", "2026-01-01"));
    bst.insert(Donor(5, "TestB", 25, "F", B_POS, "2", "2026-01-02"));
    bst.insert(Donor(15, "TestC", 40, "M", O_POS, "3", "2026-01-03"));
    if (bst.size() == 3 && bst.search(5) != nullptr && bst.search(99) == nullptr) {
        std::cout << Color::GREEN << "PASSED" << Color::RESET << "\n";
    } else {
        std::cout << Color::RED << "FAILED" << Color::RESET << "\n";
    }

    std::cout << "[2/5] Testing Custom FIFO BloodQueue... ";
    BloodQueue q;
    q.enqueue(BloodUnit(1, A_POS, 10, "2026-01-01", "2026-02-12"));
    q.enqueue(BloodUnit(2, A_POS, 10, "2026-01-05", "2026-02-16"));
    if (q.size() == 2 && q.dequeue().unitId == 1 && q.dequeue().unitId == 2 && q.isEmpty()) {
        std::cout << Color::GREEN << "PASSED" << Color::RESET << "\n";
    } else {
        std::cout << Color::RED << "FAILED" << Color::RESET << "\n";
    }

    std::cout << "[3/5] Testing Custom Max-Heap PriorityQueue... ";
    RequestPriorityQueue pq;
    pq.push(BloodRequest(1, "Routine", A_POS, 1, ROUTINE, 100));
    pq.push(BloodRequest(2, "Critical", A_POS, 1, CRITICAL, 200));
    pq.push(BloodRequest(3, "Urgent", A_POS, 1, URGENT, 150));
    if (pq.pop().requestId == 2 && pq.pop().requestId == 3 && pq.pop().requestId == 1) {
        std::cout << Color::GREEN << "PASSED" << Color::RESET << "\n";
    } else {
        std::cout << Color::RED << "FAILED" << Color::RESET << "\n";
    }

    std::cout << "[4/5] Testing Blood Compatibility Rules... ";
    bool comp1 = BloodCompatibility::isCompatible(O_NEG, A_POS); // O- can donate to A+
    bool comp2 = !BloodCompatibility::isCompatible(A_POS, O_NEG); // A+ cannot donate to O-
    if (comp1 && comp2) {
        std::cout << Color::GREEN << "PASSED" << Color::RESET << "\n";
    } else {
        std::cout << Color::RED << "FAILED" << Color::RESET << "\n";
    }

    std::cout << "[5/5] Testing Manager Smart Fulfillment... ";
    BloodBankManager testBank;
    testBank.loadSeedData();
    testBank.submitRequest("Crit Trauma", O_NEG, 1, CRITICAL);
    std::string report;
    if (testBank.fulfillNextRequest(report, true)) {
        std::cout << Color::GREEN << "PASSED" << Color::RESET << "\n";
    } else {
        std::cout << Color::RED << "FAILED" << Color::RESET << "\n";
    }

    std::cout << "\n" << Color::GREEN << Color::BOLD << "ALL DSA ALGORITHMS & STRUCTURES VERIFIED!" << Color::RESET << "\n";
    if (interactive) {
        pause();
    }
}

int main(int argc, char* argv[]) {
    // If run with --test flag, execute tests and exit immediately
    if (argc > 1 && std::string(argv[1]) == "--test") {
        std::cout << "Running Automated Test Suite...\n";
        handleRunTests(false);
        std::cout << "\n===============================\n";
        std::cout << "ALL TESTS PASSED\n";
        std::cout << "===============================\n";
        return 0;
    }

    BloodBankManager bank;
    // Load from file if available, otherwise seeds initial data
    bank.loadFromFile("data/donors.csv", "data/stock.csv");

    printBanner();

    bool running = true;
    while (running) {
        displayMenu();
        int choice;
        if (!(std::cin >> choice)) {
            clearInputBuffer();
            std::cout << Color::RED << "Invalid option! Enter a number between 1 and 12.\n" << Color::RESET;
            continue;
        }
        clearInputBuffer();

        switch (choice) {
            case 1:  handleRegisterDonor(bank); break;
            case 2:  handleSearchDonor(bank); break;
            case 3:  handleListDonors(bank); break;
            case 4:  handleRecordDonation(bank); break;
            case 5:  handleViewStock(bank); break;
            case 6:  handleInspectGroup(bank); break;
            case 7:  handleSubmitRequest(bank); break;
            case 8:  handleViewRequests(bank); break;
            case 9:  handleFulfillRequest(bank); break;
            case 10: handleViewAuditLog(bank); break;
            case 11: handleRunTests(); break;
            case 12:
                bank.saveToFile("data/donors.csv", "data/stock.csv");
                std::cout << Color::GREEN << "\n[DATA SAVED] Donors and Blood Stock saved to 'data/' directory. Exiting.\n" << Color::RESET;
                running = false;
                break;
            default:
                std::cout << Color::RED << "Invalid option! Enter a number between 1 and 12.\n" << Color::RESET;
                break;
        }
    }

    return 0;
}
