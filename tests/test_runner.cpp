#include "BloodBank.hpp"
#include <iostream>
#include <cassert>
#include <string>
#include <vector>

void testBST() {
    std::cout << "--> Testing Custom Binary Search Tree (BST)..." << std::endl;
    DonorBST bst;

    assert(bst.isEmpty());
    assert(bst.size() == 0);

    // Insert donors with out-of-order IDs
    Donor d1(105, "Alice", 25, "Female", A_POS, "111", "2026-01-01");
    Donor d2(102, "Bob", 30, "Male", B_POS, "222", "2026-01-02");
    Donor d3(108, "Charlie", 40, "Male", O_NEG, "333", "2026-01-03");
    Donor d4(101, "David", 35, "Male", AB_POS, "444", "2026-01-04");
    Donor d5(103, "Eva", 28, "Female", A_NEG, "555", "2026-01-05");

    bst.insert(d1);
    bst.insert(d2);
    bst.insert(d3);
    bst.insert(d4);
    bst.insert(d5);

    assert(bst.size() == 5);
    assert(!bst.isEmpty());

    // Search tests
    Donor* found = bst.search(103);
    assert(found != nullptr);
    assert(found->name == "Eva");
    assert(found->bloodGroup == A_NEG);

    assert(bst.search(999) == nullptr);

    // In-order traversal test (must be strictly sorted by ID)
    std::vector<Donor> inorder = bst.getAllInorder();
    assert(inorder.size() == 5);
    for (size_t i = 1; i < inorder.size(); i++) {
        assert(inorder[i - 1].id < inorder[i].id);
    }
    assert(inorder[0].id == 101);
    assert(inorder[4].id == 108);

    // Remove test (two children case: 102 has left 101 and right 103)
    bool removed = bst.remove(102);
    assert(removed);
    assert(bst.size() == 4);
    assert(bst.search(102) == nullptr);
    assert(bst.search(101) != nullptr);
    assert(bst.search(103) != nullptr);

    std::cout << "[PASS] BST operations verified" << std::endl;
}

void testQueue() {
    std::cout << "--> Testing Custom FIFO Queue for Blood Stock..." << std::endl;
    BloodQueue queue;

    assert(queue.isEmpty());
    assert(queue.size() == 0);

    // Enqueue 3 units with distinct collection dates
    BloodUnit u1(5001, O_NEG, 101, "2026-09-01", "2026-10-13");
    BloodUnit u2(5002, O_NEG, 101, "2026-09-15", "2026-10-27");
    BloodUnit u3(5003, O_NEG, 101, "2026-10-01", "2026-11-12");

    queue.enqueue(u1);
    queue.enqueue(u2);
    queue.enqueue(u3);

    assert(queue.size() == 3);
    assert(!queue.isEmpty());
    assert(queue.peek()->unitId == 5001);

    // Dequeue must strictly follow First-In First-Out (FIFO)
    BloodUnit deq1 = queue.dequeue();
    assert(deq1.unitId == 5001);
    assert(queue.size() == 2);

    BloodUnit deq2 = queue.dequeue();
    assert(deq2.unitId == 5002);
    assert(queue.size() == 1);

    BloodUnit deq3 = queue.dequeue();
    assert(deq3.unitId == 5003);
    assert(queue.isEmpty());

    std::cout << "[PASS] FIFO Queue operations verified" << std::endl;
}

void testHeap() {
    std::cout << "--> Testing Custom Max-Heap Priority Queue (Emergency Triage)..." << std::endl;
    RequestPriorityQueue pq;

    assert(pq.isEmpty());
    assert(pq.size() == 0);

    // Push requests with different urgencies and timestamps
    // Req 1: Routine (arrived at t=10)
    // Req 2: Urgent (arrived at t=20)
    // Req 3: Critical (arrived at t=30)
    // Req 4: Critical (arrived at t=25) -> should precede Req 3 because earlier arrival!
    BloodRequest r1(1, "Routine Patient A", A_POS, 1, ROUTINE, 10);
    BloodRequest r2(2, "Urgent Patient B", B_POS, 2, URGENT, 20);
    BloodRequest r3(3, "Critical Patient C", O_NEG, 1, CRITICAL, 30);
    BloodRequest r4(4, "Critical Patient D", AB_POS, 1, CRITICAL, 25);

    pq.push(r1);
    pq.push(r2);
    pq.push(r3);
    pq.push(r4);

    assert(pq.size() == 4);

    // Max-Heap Pop order must be:
    // 1st: Req 4 (Critical, t=25)
    // 2nd: Req 3 (Critical, t=30)
    // 3rd: Req 2 (Urgent, t=20)
    // 4th: Req 1 (Routine, t=10)
    BloodRequest p1 = pq.pop();
    assert(p1.requestId == 4);
    assert(p1.urgency == CRITICAL);

    BloodRequest p2 = pq.pop();
    assert(p2.requestId == 3);
    assert(p2.urgency == CRITICAL);

    BloodRequest p3 = pq.pop();
    assert(p3.requestId == 2);
    assert(p3.urgency == URGENT);

    BloodRequest p4 = pq.pop();
    assert(p4.requestId == 1);
    assert(p4.urgency == ROUTINE);

    assert(pq.isEmpty());

    std::cout << "[PASS] PriorityQueue operations verified" << std::endl;
}

void testFulfillment() {
    std::cout << "--> Testing Smart Compatibility & FIFO Fulfillment..." << std::endl;
    BloodBankManager bank;
    bank.loadSeedData();

    // Verify initial stock
    assert(bank.getStockCount(O_NEG) == 3);
    assert(bank.getStockCount(A_POS) == 4);

    // Scenario A: Exact match request
    int req1 = bank.submitRequest("John Doe", A_POS, 2, CRITICAL);
    std::string report1;
    bool success1 = bank.fulfillNextRequest(report1, true);
    assert(success1);
    assert(bank.getStockCount(A_POS) == 2); // 4 - 2 = 2

    // Scenario B: Smart compatibility fallback
    // Patient needs A- but bank only has 1 A- unit and 3 O- units
    // Request 2 units of A-. It should take 1 A- unit and 1 O- unit!
    int req2 = bank.submitRequest("Jane Smith", A_NEG, 2, URGENT);
    std::string report2;
    bool success2 = bank.fulfillNextRequest(report2, true);
    assert(success2);
    assert(bank.getStockCount(A_NEG) == 0); // 1 A- unit used
    assert(bank.getStockCount(O_NEG) == 2); // 1 O- unit used as universal donor

    std::cout << "[PASS] Compatibility and fulfillment verified" << std::endl;
}

void testPersistence() {
    std::cout << "--> Testing File Persistence & Reloading..." << std::endl;
    BloodBankManager bank;
    bank.loadSeedData();

    const std::string testDonors = "test_donors.csv";
    const std::string testStock = "test_stock.csv";

    // Save current state
    bool saved = bank.saveToFile(testDonors, testStock);
    assert(saved);

    // Create fresh instance and load
    BloodBankManager freshBank;
    bool loaded = freshBank.loadFromFile(testDonors, testStock);
    assert(loaded);

    // Verify counts match
    assert(freshBank.getDonorCount() == bank.getDonorCount());
    assert(freshBank.getTotalStockCount() == bank.getTotalStockCount());

    Donor* d = freshBank.findDonor(101);
    assert(d != nullptr);
    assert(d->name == "Dr. Alex Carter");
    assert(d->bloodGroup == O_NEG);

    // Cleanup temp files
    std::remove(testDonors.c_str());
    std::remove(testStock.c_str());

    std::cout << "[PASS] File persistence verified" << std::endl;
}

int main(int argc, char* argv[]) {
    std::string flag = (argc > 1) ? argv[1] : "--all";

    if (flag == "--unit-bst") {
        testBST();
    } else if (flag == "--unit-queue") {
        testQueue();
    } else if (flag == "--unit-heap") {
        testHeap();
    } else if (flag == "--unit-fulfillment") {
        testFulfillment();
    } else if (flag == "--unit-persistence") {
        testPersistence();
    } else {
        testBST();
        testQueue();
        testHeap();
        testFulfillment();
        testPersistence();
        std::cout << "\n===============================" << std::endl;
        std::cout << "ALL TESTS PASSED" << std::endl;
        std::cout << "===============================" << std::endl;
    }

    return 0;
}
