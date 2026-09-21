import { classifyWebhook, type PaymeWebhookOutcome } from '../src/services/payment.service';

interface Case {
  label: string;
  payload: { result?: string; payment_status?: string };
  expected: PaymeWebhookOutcome;
}

const cases: Case[] = [
  {
    label: 'wallet push notification (result SUCCESS, status PENDING) must be PENDING',
    payload: { result: 'SUCCESS', payment_status: 'PENDING' },
    expected: 'PENDING',
  },
  {
    label: 'result SUCCESS + status COMPLETED -> COMPLETED',
    payload: { result: 'SUCCESS', payment_status: 'COMPLETED' },
    expected: 'COMPLETED',
  },
  {
    label: 'status COMPLETED alone -> COMPLETED',
    payload: { payment_status: 'COMPLETED' },
    expected: 'COMPLETED',
  },
  {
    label: 'result FAILED -> FAILED',
    payload: { result: 'FAILED', payment_status: 'PENDING' },
    expected: 'FAILED',
  },
  {
    label: 'status FAILED -> FAILED',
    payload: { payment_status: 'FAILED' },
    expected: 'FAILED',
  },
  {
    label: 'result SUCCESS with no status -> PENDING (never PAID)',
    payload: { result: 'SUCCESS' },
    expected: 'PENDING',
  },
  {
    label: 'empty payload -> PENDING',
    payload: {},
    expected: 'PENDING',
  },
];

let failures = 0;
for (const testCase of cases) {
  const actual = classifyWebhook(testCase.payload);
  const ok = actual === testCase.expected;
  if (!ok) failures += 1;
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  ${testCase.label} -> ${actual} (expected ${testCase.expected})`
  );
}

console.log('---------------------------------------------');
if (failures === 0) {
  console.log(`ALL ${cases.length} CASES PASS`);
  process.exit(0);
}
console.log(`${failures} / ${cases.length} CASES FAILED`);
process.exit(1);
