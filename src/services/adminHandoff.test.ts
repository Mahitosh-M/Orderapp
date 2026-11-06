import { afterEach, describe, expect, it, vi } from 'vitest'
const mocks=vi.hoisted(()=>({signIn:vi.fn().mockResolvedValue({}),verify:vi.fn().mockResolvedValue(undefined)}))
vi.mock('firebase/auth',()=>({inMemoryPersistence:'memory',setPersistence:vi.fn().mockResolvedValue(undefined),signInWithCustomToken:mocks.signIn}))
vi.mock('./categoryAdminService',()=>({getCategoryAdminServices:()=>({auth:{}}),requireCategoryAdmin:mocks.verify}))
import { acceptAdminHandoff } from './adminHandoff'
afterEach(()=>{vi.clearAllMocks();window.history.replaceState(null,'','/');window.opener=null})
describe('CISapp Admin handoff',()=>{
 it('rejects direct links and forged messages, accepts only the matching CISapp opener',async()=>{
  const error=vi.fn();const none=acceptAdminHandoff(error);expect(error).toHaveBeenCalled();none()
  const parent={postMessage:vi.fn()};window.opener=parent
  const nonce='12345678-1234-1234-1234-123456789abc',origin='https://cisapp-236ab.web.app'
  window.history.replaceState(null,'','/admin#'+new URLSearchParams({nonce,source:origin}))
  const cleanup=acceptAdminHandoff(error)
  expect(parent.postMessage).toHaveBeenCalledWith({type:'orderapp-admin-ready',nonce},origin)
  const send=(from:string,source:unknown,tokenNonce=nonce)=>{const event=new MessageEvent('message',{origin:from,data:{type:'cisapp-admin-session',nonce:tokenNonce,token:'test-custom-token'}});Object.defineProperty(event,'source',{value:source});window.dispatchEvent(event)}
  send('https://attacker.example',parent);send(origin,{});send(origin,parent,'wrong')
  expect(mocks.signIn).not.toHaveBeenCalled()
  send(origin,parent)
  await vi.waitFor(()=>expect(parent.postMessage).toHaveBeenCalledWith({type:'orderapp-admin-connected',nonce},origin))
  expect(mocks.verify).toHaveBeenCalledOnce();expect(mocks.signIn).toHaveBeenCalledOnce();expect(window.location.hash).toBe('');expect(window.opener).toBeNull()
  cleanup()
 })
})
