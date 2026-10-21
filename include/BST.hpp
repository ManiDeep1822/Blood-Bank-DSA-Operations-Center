#ifndef BST_HPP
#define BST_HPP

#include "Models.hpp"
#include <vector>
#include <iostream>

struct BSTNode {
    Donor data;
    BSTNode* left;
    BSTNode* right;

    BSTNode(const Donor& donor) : data(donor), left(nullptr), right(nullptr) {}
};

class DonorBST {
private:
    BSTNode* root;
    int nodeCount;

    BSTNode* insertHelper(BSTNode* node, const Donor& donor, bool& inserted) {
        if (node == nullptr) {
            inserted = true;
            return new BSTNode(donor);
        }
        if (donor.id < node->data.id) {
            node->left = insertHelper(node->left, donor, inserted);
        } else if (donor.id > node->data.id) {
            node->right = insertHelper(node->right, donor, inserted);
        } else {
            // Duplicate ID - update existing donor record
            node->data = donor;
            inserted = false;
        }
        return node;
    }

    BSTNode* searchHelper(BSTNode* node, int id) const {
        if (node == nullptr || node->data.id == id) {
            return node;
        }
        if (id < node->data.id) {
            return searchHelper(node->left, id);
        }
        return searchHelper(node->right, id);
    }

    BSTNode* findMinNode(BSTNode* node) const {
        BSTNode* current = node;
        while (current && current->left != nullptr) {
            current = current->left;
        }
        return current;
    }

    BSTNode* removeHelper(BSTNode* node, int id, bool& removed) {
        if (node == nullptr) {
            return nullptr;
        }

        if (id < node->data.id) {
            node->left = removeHelper(node->left, id, removed);
        } else if (id > node->data.id) {
            node->right = removeHelper(node->right, id, removed);
        } else {
            // Node found
            removed = true;
            // Case 1: No children (leaf)
            if (node->left == nullptr && node->right == nullptr) {
                delete node;
                return nullptr;
            }
            // Case 2: One child
            else if (node->left == nullptr) {
                BSTNode* temp = node->right;
                delete node;
                return temp;
            } else if (node->right == nullptr) {
                BSTNode* temp = node->left;
                delete node;
                return temp;
            }
            // Case 3: Two children - find in-order successor (min in right subtree)
            BSTNode* successor = findMinNode(node->right);
            node->data = successor->data;
            node->right = removeHelper(node->right, successor->data.id, removed);
        }
        return node;
    }

    void inorderHelper(BSTNode* node, std::vector<Donor>& list) const {
        if (node != nullptr) {
            inorderHelper(node->left, list);
            list.push_back(node->data);
            inorderHelper(node->right, list);
        }
    }

    void destroyTree(BSTNode* node) {
        if (node != nullptr) {
            destroyTree(node->left);
            destroyTree(node->right);
            delete node;
        }
    }

public:
    DonorBST() : root(nullptr), nodeCount(0) {}

    ~DonorBST() {
        clear();
    }

    void clear() {
        destroyTree(root);
        root = nullptr;
        nodeCount = 0;
    }

    bool insert(const Donor& donor) {
        bool inserted = false;
        root = insertHelper(root, donor, inserted);
        if (inserted) {
            nodeCount++;
        }
        return inserted;
    }

    Donor* search(int id) const {
        BSTNode* found = searchHelper(root, id);
        return (found != nullptr) ? &(found->data) : nullptr;
    }

    bool remove(int id) {
        bool removed = false;
        root = removeHelper(root, id, removed);
        if (removed) {
            nodeCount--;
        }
        return removed;
    }

    int size() const {
        return nodeCount;
    }

    bool isEmpty() const {
        return root == nullptr;
    }

    std::vector<Donor> getAllInorder() const {
        std::vector<Donor> list;
        inorderHelper(root, list);
        return list;
    }
};

#endif // BST_HPP
