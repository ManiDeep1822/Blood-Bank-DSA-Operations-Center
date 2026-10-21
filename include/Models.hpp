#ifndef MODELS_HPP
#define MODELS_HPP

#include <string>
#include <vector>
#include <sstream>

enum BloodGroup {
    A_POS = 0,
    A_NEG = 1,
    B_POS = 2,
    B_NEG = 3,
    AB_POS = 4,
    AB_NEG = 5,
    O_POS = 6,
    O_NEG = 7,
    UNKNOWN_GROUP = -1
};

inline std::string bloodGroupToString(BloodGroup bg) {
    switch (bg) {
        case A_POS: return "A+";
        case A_NEG: return "A-";
        case B_POS: return "B+";
        case B_NEG: return "B-";
        case AB_POS: return "AB+";
        case AB_NEG: return "AB-";
        case O_POS: return "O+";
        case O_NEG: return "O-";
        default: return "Unknown";
    }
}

inline BloodGroup stringToBloodGroup(const std::string& str) {
    if (str == "A+" || str == "a+") return A_POS;
    if (str == "A-" || str == "a-") return A_NEG;
    if (str == "B+" || str == "b+") return B_POS;
    if (str == "B-" || str == "b-") return B_NEG;
    if (str == "AB+" || str == "ab+" || str == "Ab+") return AB_POS;
    if (str == "AB-" || str == "ab-" || str == "Ab-") return AB_NEG;
    if (str == "O+" || str == "o+") return O_POS;
    if (str == "O-" || str == "o-") return O_NEG;
    return UNKNOWN_GROUP;
}

inline bool isValidBloodGroup(const std::string& str) {
    return stringToBloodGroup(str) != UNKNOWN_GROUP;
}

enum UrgencyLevel {
    ROUTINE = 1,
    URGENT = 2,
    CRITICAL = 3
};

inline std::string urgencyToString(UrgencyLevel u) {
    switch (u) {
        case CRITICAL: return "CRITICAL (Emergency/Trauma)";
        case URGENT: return "URGENT (Surgery/Low Hb)";
        case ROUTINE: return "ROUTINE (Planned Procedure)";
        default: return "ROUTINE";
    }
}

struct Donor {
    int id;
    std::string name;
    int age;
    std::string gender;
    BloodGroup bloodGroup;
    std::string contact;
    std::string lastDonationDate;

    Donor() : id(0), age(0), bloodGroup(UNKNOWN_GROUP) {}
    Donor(int id, std::string name, int age, std::string gender,
          BloodGroup bloodGroup, std::string contact, std::string lastDonationDate)
        : id(id), name(name), age(age), gender(gender),
          bloodGroup(bloodGroup), contact(contact), lastDonationDate(lastDonationDate) {}

    std::string toCSV() const {
        std::ostringstream ss;
        ss << id << "," << name << "," << age << "," << gender << ","
           << bloodGroupToString(bloodGroup) << "," << contact << "," << lastDonationDate;
        return ss.str();
    }
};

struct BloodUnit {
    int unitId;
    BloodGroup bloodGroup;
    int donorId;
    std::string collectionDate; // YYYY-MM-DD
    std::string expiryDate;     // YYYY-MM-DD

    BloodUnit() : unitId(0), bloodGroup(UNKNOWN_GROUP), donorId(0) {}
    BloodUnit(int unitId, BloodGroup bloodGroup, int donorId,
              std::string collectionDate, std::string expiryDate)
        : unitId(unitId), bloodGroup(bloodGroup), donorId(donorId),
          collectionDate(collectionDate), expiryDate(expiryDate) {}

    std::string toCSV() const {
        std::ostringstream ss;
        ss << unitId << "," << bloodGroupToString(bloodGroup) << "," << donorId << ","
           << collectionDate << "," << expiryDate;
        return ss.str();
    }
};

struct BloodRequest {
    int requestId;
    std::string patientName;
    BloodGroup bloodGroupNeeded;
    int unitsNeeded;
    UrgencyLevel urgency;
    long long timestamp; // Arrival sequence / epoch tie-breaker
    std::string status;  // PENDING, FULFILLED, PARTIALLY_FULFILLED

    BloodRequest() : requestId(0), bloodGroupNeeded(UNKNOWN_GROUP), unitsNeeded(0),
                     urgency(ROUTINE), timestamp(0), status("PENDING") {}

    BloodRequest(int reqId, std::string patient, BloodGroup bg, int units,
                 UrgencyLevel urg, long long time, std::string stat = "PENDING")
        : requestId(reqId), patientName(patient), bloodGroupNeeded(bg),
          unitsNeeded(units), urgency(urg), timestamp(time), status(stat) {}
};

#endif // MODELS_HPP
