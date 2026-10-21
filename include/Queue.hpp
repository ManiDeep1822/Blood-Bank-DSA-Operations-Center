#ifndef QUEUE_HPP
#define QUEUE_HPP

#include "Models.hpp"
#include <vector>
#include <stdexcept>

struct QueueNode {
    BloodUnit data;
    QueueNode* next;

    QueueNode(const BloodUnit& unit) : data(unit), next(nullptr) {}
};

class BloodQueue {
private:
    QueueNode* frontNode;
    QueueNode* rearNode;
    int count;

public:
    BloodQueue() : frontNode(nullptr), rearNode(nullptr), count(0) {}

    ~BloodQueue() {
        clear();
    }

    void clear() {
        while (frontNode != nullptr) {
            QueueNode* temp = frontNode;
            frontNode = frontNode->next;
            delete temp;
        }
        rearNode = nullptr;
        count = 0;
    }

    void enqueue(const BloodUnit& unit) {
        QueueNode* newNode = new QueueNode(unit);
        if (rearNode == nullptr) {
            frontNode = rearNode = newNode;
        } else {
            rearNode->next = newNode;
            rearNode = newNode;
        }
        count++;
    }

    BloodUnit dequeue() {
        if (isEmpty()) {
            throw std::runtime_error("Attempted to dequeue from an empty BloodQueue");
        }
        QueueNode* temp = frontNode;
        BloodUnit result = temp->data;
        frontNode = frontNode->next;
        if (frontNode == nullptr) {
            rearNode = nullptr;
        }
        delete temp;
        count--;
        return result;
    }

    const BloodUnit* peek() const {
        if (isEmpty()) {
            return nullptr;
        }
        return &(frontNode->data);
    }

    bool isEmpty() const {
        return frontNode == nullptr;
    }

    int size() const {
        return count;
    }

    std::vector<BloodUnit> getAll() const {
        std::vector<BloodUnit> list;
        QueueNode* curr = frontNode;
        while (curr != nullptr) {
            list.push_back(curr->data);
            curr = curr->next;
        }
        return list;
    }
};

#endif // QUEUE_HPP
