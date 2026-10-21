#ifndef PRIORITY_QUEUE_HPP
#define PRIORITY_QUEUE_HPP

#include "Models.hpp"
#include <vector>
#include <stdexcept>
#include <algorithm>

class RequestPriorityQueue {
private:
    std::vector<BloodRequest> heap;

    // Returns true if reqA has STRICTLY HIGHER priority than reqB
    bool hasHigherPriority(const BloodRequest& reqA, const BloodRequest& reqB) const {
        if (reqA.urgency != reqB.urgency) {
            return reqA.urgency > reqB.urgency; // Higher urgency enum value has priority
        }
        // Tie-breaker: earlier arrival timestamp gets priority (FIFO within same tier)
        return reqA.timestamp < reqB.timestamp;
    }

    void heapifyUp(int index) {
        while (index > 0) {
            int parentIndex = (index - 1) / 2;
            if (hasHigherPriority(heap[index], heap[parentIndex])) {
                std::swap(heap[index], heap[parentIndex]);
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    void heapifyDown(int index) {
        int n = static_cast<int>(heap.size());
        while (true) {
            int bestIndex = index;
            int leftChild = 2 * index + 1;
            int rightChild = 2 * index + 2;

            if (leftChild < n && hasHigherPriority(heap[leftChild], heap[bestIndex])) {
                bestIndex = leftChild;
            }
            if (rightChild < n && hasHigherPriority(heap[rightChild], heap[bestIndex])) {
                bestIndex = rightChild;
            }

            if (bestIndex != index) {
                std::swap(heap[index], heap[bestIndex]);
                index = bestIndex;
            } else {
                break;
            }
        }
    }

public:
    RequestPriorityQueue() {}

    void push(const BloodRequest& req) {
        heap.push_back(req);
        heapifyUp(static_cast<int>(heap.size()) - 1);
    }

    BloodRequest pop() {
        if (isEmpty()) {
            throw std::runtime_error("Attempted to pop from an empty RequestPriorityQueue");
        }
        BloodRequest topItem = heap[0];
        heap[0] = heap.back();
        heap.pop_back();
        if (!heap.empty()) {
            heapifyDown(0);
        }
        return topItem;
    }

    const BloodRequest* top() const {
        if (isEmpty()) {
            return nullptr;
        }
        return &heap[0];
    }

    bool isEmpty() const {
        return heap.empty();
    }

    int size() const {
        return static_cast<int>(heap.size());
    }

    void clear() {
        heap.clear();
    }

    // Returns a copy of all requests ordered from highest priority to lowest
    std::vector<BloodRequest> getOrderedRequests() const {
        RequestPriorityQueue tempCopy = *this;
        std::vector<BloodRequest> sortedList;
        while (!tempCopy.isEmpty()) {
            sortedList.push_back(tempCopy.pop());
        }
        return sortedList;
    }
};

#endif // PRIORITY_QUEUE_HPP
