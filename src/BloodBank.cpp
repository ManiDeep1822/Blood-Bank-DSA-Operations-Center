#include "BloodBank.hpp"
#include <fstream>
#include <sstream>
#include <iostream>
#include <iomanip>

BloodBankManager::BloodBankManager()
    : nextDonorId(101), nextUnitId(5001), nextRequestId(1), requestTimestampCounter(1) {}

std::string BloodBankManager::calculateExpiry(const std::string& collectionDate) {
    // If format YYYY-MM-DD is given, parse year, month, day and add 42 days (~6 weeks)
    int y = 2026, m = 10, d = 1;
    if (collectionDate.length() >= 10 && collectionDate[4] == '-' && collectionDate[7] == '-') {
        try {
            y = std::stoi(collectionDate.substr(0, 4));
            m = std::stoi(collectionDate.substr(5, 2));
            d = std::stoi(collectionDate.substr(8, 2));
        } catch (...) {
            return collectionDate + " (+42d)";
        }
    }

    // Add 42 days approximately
    d += 42;
    while (d > 30) {
        d -= 30;
        m++;
        if (m > 12) {
            m = 1;
            y++;
        }
    }

    std::ostringstream ss;
    ss << y << "-"
       << (m < 10 ? "0" : "") << m << "-"
       << (d < 10 ? "0" : "") << d;
    return ss.str();
}

bool BloodBankManager::registerDonor(const std::string& name, int age, const std::string& gender,
                                     BloodGroup bg, const std::string& phone,
                                     std::string& errorMsg, int customId) {
    if (name.empty()) {
        errorMsg = "Donor name cannot be empty.";
        return false;
    }
    if (age < 18 || age > 65) {
        errorMsg = "Eligibility Error: Donor age must be between 18 and 65 years.";
        return false;
    }
    if (bg == UNKNOWN_GROUP) {
        errorMsg = "Invalid blood group specified.";
        return false;
    }

    int idToUse = (customId > 0) ? customId : nextDonorId++;
    if (idToUse >= nextDonorId) {
        nextDonorId = idToUse + 1;
    }

    Donor newDonor(idToUse, name, age, gender, bg, phone, "None");
    donorTree.insert(newDonor);
    return true;
}

Donor* BloodBankManager::findDonor(int id) {
    return donorTree.search(id);
}

bool BloodBankManager::removeDonor(int id) {
    return donorTree.remove(id);
}

std::vector<Donor> BloodBankManager::listAllDonors() {
    return donorTree.getAllInorder();
}

int BloodBankManager::getDonorCount() const {
    return donorTree.size();
}

bool BloodBankManager::recordDonation(int donorId, const std::string& collectionDate,
                                     int& generatedUnitId, std::string& errorMsg) {
    Donor* donor = donorTree.search(donorId);
    if (!donor) {
        errorMsg = "Donor ID not found in database.";
        return false;
    }

    donor->lastDonationDate = collectionDate;
    std::string expiry = calculateExpiry(collectionDate);

    generatedUnitId = nextUnitId++;
    BloodUnit unit(generatedUnitId, donor->bloodGroup, donorId, collectionDate, expiry);

    stock[donor->bloodGroup].enqueue(unit);

    std::ostringstream log;
    log << "Donation recorded: Unit #" << generatedUnitId << " ("
        << bloodGroupToString(donor->bloodGroup) << ") from Donor #" << donorId;
    auditLog.push_back(log.str());

    return true;
}

void BloodBankManager::addDirectStock(const BloodUnit& unit) {
    if (unit.bloodGroup >= 0 && unit.bloodGroup < 8) {
        stock[unit.bloodGroup].enqueue(unit);
        if (unit.unitId >= nextUnitId) {
            nextUnitId = unit.unitId + 1;
        }
    }
}

int BloodBankManager::getStockCount(BloodGroup bg) const {
    if (bg >= 0 && bg < 8) {
        return stock[bg].size();
    }
    return 0;
}

int BloodBankManager::getTotalStockCount() const {
    int total = 0;
    for (int i = 0; i < 8; i++) {
        total += stock[i].size();
    }
    return total;
}

std::vector<BloodUnit> BloodBankManager::getUnitsForGroup(BloodGroup bg) const {
    if (bg >= 0 && bg < 8) {
        return stock[bg].getAll();
    }
    return {};
}

int BloodBankManager::submitRequest(const std::string& patientName, BloodGroup bg,
                                    int unitsNeeded, UrgencyLevel urgency,
                                    long long forcedTimestamp) {
    long long ts = (forcedTimestamp >= 0) ? forcedTimestamp : requestTimestampCounter++;
    int reqId = nextRequestId++;
    BloodRequest req(reqId, patientName, bg, unitsNeeded, urgency, ts, "PENDING");
    requestQueue.push(req);
    return reqId;
}

const BloodRequest* BloodBankManager::peekNextRequest() const {
    return requestQueue.top();
}

int BloodBankManager::getPendingRequestCount() const {
    return requestQueue.size();
}

std::vector<BloodRequest> BloodBankManager::getPendingRequests() const {
    return requestQueue.getOrderedRequests();
}

bool BloodBankManager::fulfillNextRequest(std::string& summaryReport, bool smartCompatibility) {
    if (requestQueue.isEmpty()) {
        summaryReport = "No pending blood requests in queue.";
        return false;
    }

    BloodRequest req = requestQueue.pop();
    std::ostringstream report;
    report << "Processing Request #" << req.requestId << " for Patient: " << req.patientName << "\n";
    report << "Blood Group Needed: " << bloodGroupToString(req.bloodGroupNeeded)
           << " | Units Needed: " << req.unitsNeeded << "\n";
    report << "Triage Priority: " << urgencyToString(req.urgency) << "\n";

    // Determine compatible donor groups
    std::vector<BloodGroup> searchGroups;
    if (smartCompatibility) {
        searchGroups = BloodCompatibility::getCompatibleDonors(req.bloodGroupNeeded);
    } else {
        searchGroups.push_back(req.bloodGroupNeeded);
    }

    // Check available units across compatible groups
    int availableUnits = 0;
    for (BloodGroup bg : searchGroups) {
        availableUnits += stock[bg].size();
    }

    if (availableUnits < req.unitsNeeded) {
        // Insufficient blood stock
        report << "\n[ALERT] INSUFFICIENT STOCK!\n";
        report << "Requested: " << req.unitsNeeded << " unit(s), but only "
               << availableUnits << " compatible unit(s) available in entire bank.\n";
        report << "Action: Request returned to priority queue as critical pending.\n";
        requestQueue.push(req); // Re-queue
        summaryReport = report.str();
        return false;
    }

    // Dispense units in FIFO order according to preference order
    int unitsDispensed = 0;
    report << "\n[DISPENSING UNITS - FIFO ORDER]:\n";

    for (BloodGroup bg : searchGroups) {
        while (!stock[bg].isEmpty() && unitsDispensed < req.unitsNeeded) {
            BloodUnit unit = stock[bg].dequeue();
            unitsDispensed++;
            report << "  - Unit #" << unit.unitId << " (" << bloodGroupToString(unit.bloodGroup)
                   << ") | Collected: " << unit.collectionDate
                   << " | Expires: " << unit.expiryDate;
            if (unit.bloodGroup != req.bloodGroupNeeded) {
                report << " [COMPATIBLE ALTERNATIVE]";
            } else {
                report << " [EXACT MATCH]";
            }
            report << "\n";
        }
        if (unitsDispensed == req.unitsNeeded) break;
    }

    report << "\n[STATUS]: Request #" << req.requestId << " FULLY FULFILLED ("
           << unitsDispensed << "/" << req.unitsNeeded << " units dispensed).\n";

    std::ostringstream auditEntry;
    auditEntry << "Fulfilled Request #" << req.requestId << " (" << req.patientName << ") with "
               << unitsDispensed << " units of " << bloodGroupToString(req.bloodGroupNeeded);
    auditLog.push_back(auditEntry.str());

    summaryReport = report.str();
    return true;
}

void BloodBankManager::clearAll() {
    donorTree.clear();
    for (int i = 0; i < 8; i++) {
        stock[i].clear();
    }
    requestQueue.clear();
    auditLog.clear();
    nextDonorId = 101;
    nextUnitId = 5001;
    nextRequestId = 1;
    requestTimestampCounter = 1;
}

void BloodBankManager::loadSeedData() {
    clearAll();
    std::string err;

    // 8 Preloaded Donors covering each blood group
    registerDonor("Dr. Alex Carter", 34, "Male", O_NEG, "+1-555-0101", err, 101);
    registerDonor("Sarah Jenkins", 28, "Female", A_POS, "+1-555-0102", err, 102);
    registerDonor("Michael Chen", 42, "Male", B_POS, "+1-555-0103", err, 103);
    registerDonor("Emily Watson", 31, "Female", AB_POS, "+1-555-0104", err, 104);
    registerDonor("David Miller", 45, "Male", O_POS, "+1-555-0105", err, 105);
    registerDonor("Jessica Taylor", 25, "Female", A_NEG, "+1-555-0106", err, 106);
    registerDonor("Robert Kumar", 39, "Male", B_NEG, "+1-555-0107", err, 107);
    registerDonor("Sophia Rodriguez", 36, "Female", AB_NEG, "+1-555-0108", err, 108);

    // Realistic Blood Units (Oldest collected first to demonstrate FIFO)
    addDirectStock(BloodUnit(5001, O_NEG, 101, "2026-09-01", "2026-10-13"));
    addDirectStock(BloodUnit(5002, O_NEG, 101, "2026-09-15", "2026-10-27"));
    addDirectStock(BloodUnit(5003, O_NEG, 101, "2026-10-01", "2026-11-12"));

    addDirectStock(BloodUnit(5004, A_POS, 102, "2026-09-05", "2026-10-17"));
    addDirectStock(BloodUnit(5005, A_POS, 102, "2026-09-20", "2026-11-01"));
    addDirectStock(BloodUnit(5006, A_POS, 102, "2026-10-02", "2026-11-13"));
    addDirectStock(BloodUnit(5007, A_POS, 102, "2026-10-08", "2026-11-19"));

    addDirectStock(BloodUnit(5008, B_POS, 103, "2026-09-10", "2026-10-22"));
    addDirectStock(BloodUnit(5009, B_POS, 103, "2026-10-03", "2026-11-14"));

    addDirectStock(BloodUnit(5010, AB_POS, 104, "2026-09-12", "2026-10-24"));
    addDirectStock(BloodUnit(5011, AB_POS, 104, "2026-10-05", "2026-11-16"));

    addDirectStock(BloodUnit(5012, O_POS, 105, "2026-09-08", "2026-10-20"));
    addDirectStock(BloodUnit(5013, O_POS, 105, "2026-09-25", "2026-11-06"));
    addDirectStock(BloodUnit(5014, O_POS, 105, "2026-10-04", "2026-11-15"));

    addDirectStock(BloodUnit(5015, A_NEG, 106, "2026-09-18", "2026-10-30"));
    addDirectStock(BloodUnit(5016, B_NEG, 107, "2026-09-22", "2026-11-03"));
    addDirectStock(BloodUnit(5017, AB_NEG, 108, "2026-09-26", "2026-11-07"));
}

bool BloodBankManager::saveToFile(const std::string& donorsPath, const std::string& stockPath) {
    // Write donors
    std::ofstream dFile(donorsPath);
    if (!dFile.is_open()) return false;
    dFile << "id,name,age,gender,bloodGroup,contact,lastDonationDate\n";
    std::vector<Donor> allDonors = donorTree.getAllInorder();
    for (const auto& d : allDonors) {
        dFile << d.toCSV() << "\n";
    }
    dFile.close();

    // Write stock
    std::ofstream sFile(stockPath);
    if (!sFile.is_open()) return false;
    sFile << "unitId,bloodGroup,donorId,collectionDate,expiryDate\n";
    for (int i = 0; i < 8; i++) {
        std::vector<BloodUnit> units = stock[i].getAll();
        for (const auto& u : units) {
            sFile << u.toCSV() << "\n";
        }
    }
    sFile.close();
    return true;
}

bool BloodBankManager::loadFromFile(const std::string& donorsPath, const std::string& stockPath) {
    std::ifstream dFile(donorsPath);
    std::ifstream sFile(stockPath);

    if (!dFile.is_open() || !sFile.is_open()) {
        // Files don't exist yet, seed initial data
        loadSeedData();
        saveToFile(donorsPath, stockPath);
        return true;
    }

    clearAll();

    // Load Donors
    std::string line;
    std::getline(dFile, line); // Skip header
    while (std::getline(dFile, line)) {
        if (line.empty()) continue;
        std::stringstream ss(line);
        std::string sId, name, sAge, gender, sBg, contact, lastDate;
        if (std::getline(ss, sId, ',') &&
            std::getline(ss, name, ',') &&
            std::getline(ss, sAge, ',') &&
            std::getline(ss, gender, ',') &&
            std::getline(ss, sBg, ',') &&
            std::getline(ss, contact, ',') &&
            std::getline(ss, lastDate, ',')) {
            try {
                int id = std::stoi(sId);
                int age = std::stoi(sAge);
                BloodGroup bg = stringToBloodGroup(sBg);
                Donor d(id, name, age, gender, bg, contact, lastDate);
                donorTree.insert(d);
                if (id >= nextDonorId) nextDonorId = id + 1;
            } catch (...) {}
        }
    }
    dFile.close();

    // Load Stock
    std::getline(sFile, line); // Skip header
    while (std::getline(sFile, line)) {
        if (line.empty()) continue;
        std::stringstream ss(line);
        std::string sUnitId, sBg, sDonorId, collDate, expDate;
        if (std::getline(ss, sUnitId, ',') &&
            std::getline(ss, sBg, ',') &&
            std::getline(ss, sDonorId, ',') &&
            std::getline(ss, collDate, ',') &&
            std::getline(ss, expDate, ',')) {
            try {
                int uid = std::stoi(sUnitId);
                BloodGroup bg = stringToBloodGroup(sBg);
                int did = std::stoi(sDonorId);
                BloodUnit u(uid, bg, did, collDate, expDate);
                addDirectStock(u);
            } catch (...) {}
        }
    }
    sFile.close();

    return true;
}
