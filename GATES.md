# GATES.md - Blood Bank Management DSA System

## G1: Custom Binary Search Tree Verification
  CHECK: .\bin\test_dsa.exe --unit-bst
  EXPECT: [PASS] BST operations verified

## G2: Custom FIFO Blood Stock Queue Verification
  CHECK: .\bin\test_dsa.exe --unit-queue
  EXPECT: [PASS] FIFO Queue operations verified

## G3: Custom Max-Heap Priority Queue (Emergency Triage) Verification
  CHECK: .\bin\test_dsa.exe --unit-heap
  EXPECT: [PASS] PriorityQueue operations verified

## G4: Smart Compatibility Matching & FIFO Fulfillment Verification
  CHECK: .\bin\test_dsa.exe --unit-fulfillment
  EXPECT: [PASS] Compatibility and fulfillment verified

## G5: File Persistence & Seed Data Verification
  CHECK: .\bin\test_dsa.exe --unit-persistence
  EXPECT: [PASS] File persistence verified

## G6: End-to-End Build & Automated Suite Verification
  CHECK: .\bin\bloodbank.exe --test
  EXPECT: ALL TESTS PASSED

## G7: Full-Width Clinical Web UI Production Build
  CHECK: cd ui && npm run build
  EXPECT: built in

## G8: Local Bridge API Operations Verification
  CHECK: powershell -Command "(Invoke-RestMethod -Uri 'http://localhost:5000/api/stats').totalUnits"
  EXPECT: 15

## G9: Negative Constraint Audit (Zero Occurrences of Banned Word)
  CHECK: node -e "const fs=require('fs'),path=require('path');function walk(d){let r=[];fs.readdirSync(d).forEach(f=>{let p=path.join(d,f);if(fs.statSync(p).isDirectory())r=r.concat(walk(p));else if(/\.(jsx?|html|css)$/.test(f))r.push(p);});return r;}const files=walk('ui/src').concat(['server.js']);let count=0;files.forEach(f=>{if(fs.readFileSync(f,'utf8').toLowerCase().includes('enterprise'))count++;});if(count===0)console.log('CLEAN: 0 OCCURRENCES');"
  EXPECT: CLEAN: 0 OCCURRENCES
