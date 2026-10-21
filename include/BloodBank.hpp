#ifndef BLOOD_BANK_HPP
#define BLOOD_BANK_HPP

#include "Models.hpp"
#include "BST.hpp"
#include "Queue.hpp"
#include "PriorityQueue.hpp"
#include "Compatibility.hpp"
#include <string>
#include <vector>

class BloodBankManager {
private:
    DonorBST donorTree;
    BloodQueue stock[8]; // One FIFO queue for each BloodGroup index (0 to 7)
    RequestPriorityQueue requestQueue;
    std::vector<std::string> auditLog;

    int nextDonorId;
    int nextUnitId;
    int nextRequestId;
    long long requestTimestampCounter;

    std::string calculateExpiry(const std::string& collectionDate);

public:
    BloodBankManager();

    // Donor Operations (via BST)
    bool registerDonor(const std::string& name, int age, const std::string& gender,
                       BloodGroup bg, const std::string& phone,
                       std::string& errorMsg, int customId = -1);
    Donor* findDonor(int id);
    bool removeDonor(int id);
    std::vector<Donor> listAllDonors();
    int getDonorCount() const;

    // Blood Stock & Donation (via FIFO Queues)
    bool recordDonation(int donorId, const std::string& collectionDate,
                        int& generatedUnitId, std::string& errorMsg);
    void addDirectStock(const BloodUnit& unit);
    int getStockCount(BloodGroup bg) const;
    int getTotalStockCount() const;
    std::vector<BloodUnit> getUnitsForGroup(BloodGroup bg) const;

    // Patient Request & Triage (via Max-Heap Priority Queue)
    int submitRequest(const std::string& patientName, BloodGroup bg,
                      int unitsNeeded, UrgencyLevel urgency, long long forcedTimestamp = -1);
    const BloodRequest* peekNextRequest() const;
    int getPendingRequestCount() const;
    std::vector<BloodRequest> getPendingRequests() const;

    // Request Fulfillment (FIFO + Compatibility matching)
    bool fulfillNextRequest(std::string& summaryReport, bool smartCompatibility = true);

    // Seed Data & File Persistence
    void loadSeedData();
    bool saveToFile(const std::string& donorsPath = "data/donors.csv",
                    const std::string& stockPath = "data/stock.csv");
    bool loadFromFile(const std::string& donorsPath = "data/donors.csv",
                     const std::string& stockPath = "data/stock.csv");

    // Audit and Inspection
    const std::vector<std::string>& getAuditLog() const { return auditLog; }
    void clearAll();
};

#endif // BLOOD_BANK_HPP
