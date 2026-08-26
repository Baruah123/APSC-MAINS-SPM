import { z } from 'zod';

const schema = z.string().uuid();

const testUUIDs = [
  'b4e2f4a5-8e33-4652-c9e0-3f33c8b9b2b4',
  'e1f4b6c7-0a55-4874-ebf2-5f55eadbd4d6',
  'c5f3a5b6-9f44-4763-daf1-4f44d9cac3c5',
  'a3c1e3d3-7d22-4541-b8d9-2f22b7a8a1a3',
  'f2f4b6c7-0a55-4874-ebf2-5f55eadbd4d6',
  'g3f4b6c7-0a55-4874-ebf2-5f55eadbd4d6',
  'h4f4b6c7-0a55-4874-ebf2-5f55eadbd4d6',
];

for (const id of testUUIDs) {
  const result = schema.safeParse(id);
  console.log(`${id}: ${result.success}`);
}
