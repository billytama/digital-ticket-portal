import {test} from 'node:test';
import assert from 'node:assert/strict';
import {signSession,verifySession,checkPassword,sessionCookie,cookie} from '../standalone/auth.ts';
const secret='a-long-test-only-session-secret-1234567890';
test('session verifies before expiry and rejects expiry, forgery and other secrets',async()=>{const now=1000;const token=await signSession(secret,now);assert.equal(await verifySession(token,secret,now+1),true);assert.equal(await verifySession(token,secret,now+8*3600000),false);assert.equal(await verifySession(token+'a',secret,now),false);assert.equal(await verifySession(token,secret+'x',now),false);assert.equal(await verifySession('garbage',secret,now),false);});
test('password comparison accepts only exact password',async()=>{assert.equal(await checkPassword('long-password-123','long-password-123'),true);assert.equal(await checkPassword('wrong','long-password-123'),false);});
test('session cookie is HttpOnly, same-site and secure in production',()=>{const c=sessionCookie('abc',true);assert.match(c,/HttpOnly/);assert.match(c,/SameSite=Strict/);assert.match(c,/Secure/);assert.match(sessionCookie('',true),/Max-Age=0/);assert.equal(cookie(new Request('https://example.com',{headers:{Cookie:'other=x; ticket_session=abc'}})),'abc');});
