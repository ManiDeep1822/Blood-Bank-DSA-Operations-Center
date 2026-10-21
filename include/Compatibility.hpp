#ifndef COMPATIBILITY_HPP
#define COMPATIBILITY_HPP

#include "Models.hpp"
#include <vector>

class BloodCompatibility {
public:
    // Returns compatible donor groups in order of preference (exact match first, then alternatives)
    static std::vector<BloodGroup> getCompatibleDonors(BloodGroup recipient) {
        switch (recipient) {
            case A_POS:
                return {A_POS, A_NEG, O_POS, O_NEG};
            case A_NEG:
                return {A_NEG, O_NEG};
            case B_POS:
                return {B_POS, B_NEG, O_POS, O_NEG};
            case B_NEG:
                return {B_NEG, O_NEG};
            case AB_POS:
                // Universal recipient: can accept all groups
                return {AB_POS, AB_NEG, A_POS, A_NEG, B_POS, B_NEG, O_POS, O_NEG};
            case AB_NEG:
                return {AB_NEG, A_NEG, B_NEG, O_NEG};
            case O_POS:
                return {O_POS, O_NEG};
            case O_NEG:
                // Universal donor: can ONLY receive O-
                return {O_NEG};
            default:
                return {};
        }
    }

    static bool isCompatible(BloodGroup donor, BloodGroup recipient) {
        std::vector<BloodGroup> compatible = getCompatibleDonors(recipient);
        for (BloodGroup bg : compatible) {
            if (bg == donor) return true;
        }
        return false;
    }
};

#endif // COMPATIBILITY_HPP
