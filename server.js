const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 5000;
const DATA_DIR = path.join(__dirname, 'data');
const DONORS_FILE = path.join(DATA_DIR, 'donors.csv');
const STOCK_FILE = path.join(DATA_DIR, 'stock.csv');
const DIST_DIR = path.join(__dirname, 'ui', 'dist');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ----------------- IN-MEMORY DSA ENGINE -----------------

// Blood Compatibility Engine
const COMPATIBILITY_RULES = {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'], // Universal Recipient
    'AB-': ['AB-', 'A-', 'B-', 'O-'],
    'O+': ['O+', 'O-'],
    'O-': ['O-'] // Universal Donor
};

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// BST Node for Donors
class BSTNode {
    constructor(donor) {
        this.data = donor;
        this.left = null;
        this.right = null;
    }
}

class DonorBST {
    constructor() {
        this.root = null;
        this.count = 0;
    }

    insert(donor) {
        let inserted = false;
        const insertRec = (node) => {
            if (!node) {
                inserted = true;
                return new BSTNode(donor);
            }
            if (donor.id < node.data.id) {
                node.left = insertRec(node.left);
            } else if (donor.id > node.data.id) {
                node.right = insertRec(node.right);
            } else {
                node.data = donor; // Update
            }
            return node;
        };
        this.root = insertRec(this.root);
        if (inserted) this.count++;
        return inserted;
    }

    search(id) {
        let curr = this.root;
        while (curr) {
            if (curr.data.id === id) return curr.data;
            if (id < curr.data.id) curr = curr.left;
            else curr = curr.right;
        }
        return null;
    }

    remove(id) {
        let removed = false;
        const removeRec = (node, targetId) => {
            if (!node) return null;
            if (targetId < node.data.id) {
                node.left = removeRec(node.left, targetId);
            } else if (targetId > node.data.id) {
                node.right = removeRec(node.right, targetId);
            } else {
                removed = true;
                if (!node.left && !node.right) return null;
                if (!node.left) return node.right;
                if (!node.right) return node.left;
                // Two children: find min in right subtree
                let successor = node.right;
                while (successor.left) successor = successor.left;
                node.data = successor.data;
                node.right = removeRec(node.right, successor.data.id);
            }
            return node;
        };
        this.root = removeRec(this.root, id);
        if (removed) this.count--;
        return removed;
    }

    inorder() {
        const result = [];
        const traverse = (node) => {
            if (node) {
                traverse(node.left);
                result.push(node.data);
                traverse(node.right);
            }
        };
        traverse(this.root);
        return result;
    }

    toVisualTree(node = this.root) {
        if (!node) return null;
        return {
            id: node.data.id,
            name: node.data.name,
            bloodGroup: node.data.bloodGroup,
            age: node.data.age,
            left: this.toVisualTree(node.left),
            right: this.toVisualTree(node.right)
        };
    }
}

// Custom Max-Heap Priority Queue for Emergency Triage
class RequestPriorityQueue {
    constructor() {
        this.heap = [];
    }

    hasHigherPriority(a, b) {
        if (a.urgency !== b.urgency) {
            return a.urgency > b.urgency; // 3 (Critical) > 2 (Urgent) > 1 (Routine)
        }
        return a.timestamp < b.timestamp; // Earlier timestamp wins
    }

    push(item) {
        this.heap.push(item);
        let index = this.heap.length - 1;
        while (index > 0) {
            let parentIndex = Math.floor((index - 1) / 2);
            if (this.hasHigherPriority(this.heap[index], this.heap[parentIndex])) {
                [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    pop() {
        if (this.heap.length === 0) return null;
        const top = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            let index = 0;
            const n = this.heap.length;
            while (true) {
                let best = index;
                let left = 2 * index + 1;
                let right = 2 * index + 2;
                if (left < n && this.hasHigherPriority(this.heap[left], this.heap[best])) {
                    best = left;
                }
                if (right < n && this.hasHigherPriority(this.heap[right], this.heap[best])) {
                    best = right;
                }
                if (best !== index) {
                    [this.heap[index], this.heap[best]] = [this.heap[best], this.heap[index]];
                    index = best;
                } else {
                    break;
                }
            }
        }
        return top;
    }

    getSortedList() {
        // Clone and extract in priority order
        const clone = new RequestPriorityQueue();
        clone.heap = [...this.heap];
        const sorted = [];
        while (clone.heap.length > 0) {
            sorted.push(clone.pop());
        }
        return sorted;
    }

    toVisualTree(index = 0) {
        if (index >= this.heap.length) return null;
        return {
            requestId: this.heap[index].requestId,
            patientName: this.heap[index].patientName,
            bloodGroup: this.heap[index].bloodGroupNeeded,
            urgency: this.heap[index].urgency,
            urgencyLabel: this.heap[index].urgencyLabel,
            unitsNeeded: this.heap[index].unitsNeeded,
            left: this.toVisualTree(2 * index + 1),
            right: this.toVisualTree(2 * index + 2)
        };
    }
}

// Global State
const donorBST = new DonorBST();
// 8 FIFO Queues
const bloodStock = {
    'A+': [],
    'A-': [],
    'B+': [],
    'B-': [],
    'AB+': [],
    'AB-': [],
    'O+': [],
    'O-': []
};
const requestQueue = new RequestPriorityQueue();
const auditLog = [];

let nextDonorId = 101;
let nextUnitId = 5001;
let nextRequestId = 1;
let requestCounter = 1;

// ----------------- CSV PERSISTENCE SYNC -----------------

function loadFromCSV() {
    if (fs.existsSync(DONORS_FILE)) {
        const content = fs.readFileSync(DONORS_FILE, 'utf8');
        const lines = content.split('\n').filter(l => l.trim().length > 0);
        // Skip header
        for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].split(',').map(s => s.trim());
            if (parts.length >= 7) {
                const id = parseInt(parts[0], 10);
                const donor = {
                    id: id,
                    name: parts[1],
                    age: parseInt(parts[2], 10),
                    gender: parts[3],
                    bloodGroup: parts[4],
                    contact: parts[5],
                    lastDonationDate: parts[6]
                };
                donorBST.insert(donor);
                if (id >= nextDonorId) nextDonorId = id + 1;
            }
        }
    }

    if (fs.existsSync(STOCK_FILE)) {
        const content = fs.readFileSync(STOCK_FILE, 'utf8');
        const lines = content.split('\n').filter(l => l.trim().length > 0);
        // Clear stock queues
        BLOOD_GROUPS.forEach(bg => bloodStock[bg] = []);
        for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].split(',').map(s => s.trim());
            if (parts.length >= 5) {
                const uid = parseInt(parts[0], 10);
                const bg = parts[1];
                const unit = {
                    unitId: uid,
                    bloodGroup: bg,
                    donorId: parseInt(parts[2], 10),
                    collectionDate: parts[3],
                    expiryDate: parts[4]
                };
                if (bloodStock[bg]) {
                    bloodStock[bg].push(unit);
                }
                if (uid >= nextUnitId) nextUnitId = uid + 1;
            }
        }
    }
}

function saveToCSV() {
    // Write donors
    const donorRows = ['id,name,age,gender,bloodGroup,contact,lastDonationDate'];
    const allDonors = donorBST.inorder();
    allDonors.forEach(d => {
        donorRows.push(`${d.id},${d.name},${d.age},${d.gender},${d.bloodGroup},${d.contact},${d.lastDonationDate}`);
    });
    fs.writeFileSync(DONORS_FILE, donorRows.join('\n') + '\n', 'utf8');

    // Write stock
    const stockRows = ['unitId,bloodGroup,donorId,collectionDate,expiryDate'];
    BLOOD_GROUPS.forEach(bg => {
        bloodStock[bg].forEach(u => {
            stockRows.push(`${u.unitId},${u.bloodGroup},${u.donorId},${u.collectionDate},${u.expiryDate}`);
        });
    });
    fs.writeFileSync(STOCK_FILE, stockRows.join('\n') + '\n', 'utf8');
}

// Calculate approximate expiry date (+42 days)
function calculateExpiry(collectionDate) {
    try {
        const date = new Date(collectionDate);
        if (isNaN(date.getTime())) {
            return collectionDate + ' (+42d)';
        }
        date.setDate(date.getDate() + 42);
        return date.toISOString().split('T')[0];
    } catch {
        return collectionDate + ' (+42d)';
    }
}

// Initial load
loadFromCSV();

// ----------------- HTTP REQUEST HANDLING -----------------

function sendJSON(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(data));
}

function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (err) {
                reject(err);
            }
        });
        req.on('error', reject);
    });
}

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
};

const server = http.createServer(async (req, res) => {
    // Enable CORS for development
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // --- API ROUTES ---

    // 1. GET /api/stats (Operational metrics)
    if (req.method === 'GET' && pathname === '/api/stats') {
        let totalUnits = 0;
        const stockSummary = {};
        BLOOD_GROUPS.forEach(bg => {
            const count = bloodStock[bg].length;
            totalUnits += count;
            stockSummary[bg] = {
                count,
                status: count === 0 ? 'CRITICAL_OUT' : count < 2 ? 'LOW_STOCK' : 'SUFFICIENT',
                oldestUnit: bloodStock[bg].length > 0 ? bloodStock[bg][0] : null
            };
        });

        sendJSON(res, 200, {
            totalUnits,
            donorCount: donorBST.count,
            pendingRequestsCount: requestQueue.heap.length,
            stockSummary
        });
        return;
    }

    // 2. GET /api/donors
    if (req.method === 'GET' && pathname === '/api/donors') {
        const queryId = parsedUrl.query.id;
        if (queryId) {
            const found = donorBST.search(parseInt(queryId, 10));
            if (found) sendJSON(res, 200, { donor: found });
            else sendJSON(res, 404, { error: 'Donor not found in BST' });
            return;
        }
        sendJSON(res, 200, { donors: donorBST.inorder() });
        return;
    }

    // 3. POST /api/donors (Register new donor)
    if (req.method === 'POST' && pathname === '/api/donors') {
        try {
            const body = await parseBody(req);
            const { name, age, gender, bloodGroup, contact } = body;
            if (!name || !age || !bloodGroup || !contact) {
                return sendJSON(res, 400, { error: 'Missing required donor registration fields.' });
            }
            if (age < 18 || age > 65) {
                return sendJSON(res, 400, { error: 'Clinical Eligibility Error: Donor must be between 18 and 65 years old.' });
            }
            if (!BLOOD_GROUPS.includes(bloodGroup)) {
                return sendJSON(res, 400, { error: 'Invalid blood group specified.' });
            }

            const newId = nextDonorId++;
            const newDonor = {
                id: newId,
                name: name.trim(),
                age: parseInt(age, 10),
                gender: gender || 'Unspecified',
                bloodGroup,
                contact: contact.trim(),
                lastDonationDate: 'None'
            };

            donorBST.insert(newDonor);
            saveToCSV();

            auditLog.unshift(`[${new Date().toLocaleTimeString()}] Registered Donor #${newId} (${name}, ${bloodGroup}) into Binary Search Tree.`);
            sendJSON(res, 201, { success: true, donor: newDonor });
        } catch (err) {
            sendJSON(res, 500, { error: err.message });
        }
        return;
    }

    // 4. DELETE /api/donors/:id
    if (req.method === 'DELETE' && pathname.startsWith('/api/donors/')) {
        const idToDelete = parseInt(pathname.split('/')[3], 10);
        if (isNaN(idToDelete)) return sendJSON(res, 400, { error: 'Invalid donor ID' });
        const removed = donorBST.remove(idToDelete);
        if (removed) {
            saveToCSV();
            auditLog.unshift(`[${new Date().toLocaleTimeString()}] Removed Donor #${idToDelete} from Binary Search Tree.`);
            sendJSON(res, 200, { success: true });
        } else {
            sendJSON(res, 404, { error: 'Donor not found' });
        }
        return;
    }

    // 5. GET /api/stock
    if (req.method === 'GET' && pathname === '/api/stock') {
        sendJSON(res, 200, { stock: bloodStock });
        return;
    }

    // 6. POST /api/stock/donate (Record blood donation)
    if (req.method === 'POST' && pathname === '/api/stock/donate') {
        try {
            const body = await parseBody(req);
            const { donorId, collectionDate } = body;
            const donor = donorBST.search(parseInt(donorId, 10));
            if (!donor) {
                return sendJSON(res, 404, { error: 'Donor ID not found in BST registry.' });
            }

            const collDate = collectionDate || new Date().toISOString().split('T')[0];
            const expDate = calculateExpiry(collDate);
            donor.lastDonationDate = collDate;

            const unit = {
                unitId: nextUnitId++,
                bloodGroup: donor.bloodGroup,
                donorId: donor.id,
                collectionDate: collDate,
                expiryDate: expDate
            };

            bloodStock[donor.bloodGroup].push(unit); // FIFO Enqueue
            saveToCSV();

            auditLog.unshift(`[${new Date().toLocaleTimeString()}] Recorded donation from Donor #${donor.id}: Enqueued Unit #${unit.unitId} (${unit.bloodGroup}) into FIFO Queue.`);
            sendJSON(res, 201, { success: true, unit });
        } catch (err) {
            sendJSON(res, 500, { error: err.message });
        }
        return;
    }

    // 7. GET /api/requests
    if (req.method === 'GET' && pathname === '/api/requests') {
        sendJSON(res, 200, { requests: requestQueue.getSortedList() });
        return;
    }

    // 8. POST /api/requests (Submit emergency request)
    if (req.method === 'POST' && pathname === '/api/requests') {
        try {
            const body = await parseBody(req);
            const { patientName, bloodGroupNeeded, unitsNeeded, urgency } = body;

            if (!patientName || !bloodGroupNeeded || !unitsNeeded) {
                return sendJSON(res, 400, { error: 'Missing request details.' });
            }

            const urgencyVal = parseInt(urgency, 10) || 1;
            const urgencyLabels = { 3: 'CRITICAL (Emergency / Trauma)', 2: 'URGENT (Surgery / Low Hb)', 1: 'ROUTINE (Planned Procedure)' };

            const reqObj = {
                requestId: nextRequestId++,
                patientName: patientName.trim(),
                bloodGroupNeeded,
                unitsNeeded: parseInt(unitsNeeded, 10),
                urgency: urgencyVal,
                urgencyLabel: urgencyLabels[urgencyVal] || 'ROUTINE',
                timestamp: requestCounter++,
                status: 'PENDING'
            };

            requestQueue.push(reqObj); // Max-Heap Push
            auditLog.unshift(`[${new Date().toLocaleTimeString()}] Patient Request #${reqObj.requestId} (${patientName}, ${reqObj.unitsNeeded}x ${bloodGroupNeeded}) queued into Max-Heap with priority: ${reqObj.urgencyLabel}`);
            sendJSON(res, 201, { success: true, request: reqObj });
        } catch (err) {
            sendJSON(res, 500, { error: err.message });
        }
        return;
    }

    // 9. POST /api/fulfill (Process highest priority request via Max-Heap + FIFO Queues)
    if (req.method === 'POST' && pathname === '/api/fulfill') {
        if (requestQueue.heap.length === 0) {
            return sendJSON(res, 400, { error: 'No pending blood requests in priority queue.' });
        }

        const topReq = requestQueue.pop(); // Max-Heap Extract-Max
        const compatibleGroups = COMPATIBILITY_RULES[topReq.bloodGroupNeeded] || [topReq.bloodGroupNeeded];

        // Check total available stock
        let availableCount = 0;
        compatibleGroups.forEach(bg => {
            availableCount += bloodStock[bg].length;
        });

        if (availableCount < topReq.unitsNeeded) {
            // Re-queue because insufficient
            requestQueue.push(topReq);
            return sendJSON(res, 409, {
                error: `Insufficient stock! Requested: ${topReq.unitsNeeded} units of ${topReq.bloodGroupNeeded}, but only ${availableCount} compatible units available across bank.`,
                requestRequeued: true
            });
        }

        // Dispense in FIFO order, prioritizing exact match first
        const dispensedUnits = [];
        let remainingToDispense = topReq.unitsNeeded;

        for (const bg of compatibleGroups) {
            while (bloodStock[bg].length > 0 && remainingToDispense > 0) {
                const unit = bloodStock[bg].shift(); // FIFO Dequeue!
                dispensedUnits.push({
                    ...unit,
                    isExactMatch: unit.bloodGroup === topReq.bloodGroupNeeded
                });
                remainingToDispense--;
            }
            if (remainingToDispense === 0) break;
        }

        saveToCSV();

        const auditEntry = `[${new Date().toLocaleTimeString()}] FULFILLED Request #${topReq.requestId} for ${topReq.patientName} (${topReq.unitsNeeded}x ${topReq.bloodGroupNeeded}). Dispensed ${dispensedUnits.map(u => `#${u.unitId} (${u.bloodGroup})`).join(', ')}`;
        auditLog.unshift(auditEntry);

        sendJSON(res, 200, {
            success: true,
            request: topReq,
            dispensedUnits,
            auditEntry
        });
        return;
    }

    // 10. GET /api/dsa-state (Returns structured data for live visualizers)
    if (req.method === 'GET' && pathname === '/api/dsa-state') {
        sendJSON(res, 200, {
            bstRoot: donorBST.toVisualTree(),
            heapTree: requestQueue.toVisualTree(),
            heapArray: requestQueue.heap,
            queues: bloodStock
        });
        return;
    }

    // 11. GET /api/audit
    if (req.method === 'GET' && pathname === '/api/audit') {
        sendJSON(res, 200, { auditLog });
        return;
    }

    // 12. GET /api/download-presentation (Download PowerPoint presentation)
    if (req.method === 'GET' && pathname === '/api/download-presentation') {
        const pptxPath = path.join(__dirname, 'Blood_Bank_DSA_Executive_Presentation.pptx');
        if (fs.existsSync(pptxPath)) {
            res.writeHead(200, {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'Content-Disposition': 'attachment; filename="Blood_Bank_DSA_Executive_Presentation.pptx"'
            });
            fs.createReadStream(pptxPath).pipe(res);
            return;
        } else {
            return sendJSON(res, 404, { error: 'Presentation file not generated.' });
        }
    }

    // --- STATIC FILE SERVING (ui/dist) ---
    if (req.method === 'GET') {
        let filePath = path.join(DIST_DIR, pathname === '/' ? 'index.html' : pathname);
        if (!fs.existsSync(filePath)) {
            // SPA fallback
            filePath = path.join(DIST_DIR, 'index.html');
        }

        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const ext = path.extname(filePath);
            const contentType = MIME_TYPES[ext] || 'application/octet-stream';
            res.writeHead(200, { 'Content-Type': contentType });
            fs.createReadStream(filePath).pipe(res);
            return;
        }
    }

    sendJSON(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
    console.log(`Blood Bank Clinical Operations API server running on http://localhost:${PORT}`);
});
