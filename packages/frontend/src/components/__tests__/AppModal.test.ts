import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AppModal from '@/components/AppModal.vue'

describe('AppModal.vue', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('is hidden when visible is false', () => {
    const wrapper = mount(AppModal, {
      props: { visible: false, title: 'Test Modal' },
      attachTo: document.body,
    })
    // v-if="visible" removes the entire modal from DOM
    expect(wrapper.find('.app-modal').exists()).toBe(false)
  })

  it('is visible when visible is true', () => {
    const wrapper = mount(AppModal, {
      props: { visible: true, title: 'Test Modal' },
      attachTo: document.body,
    })
    // Teleport renders content at the body level
    expect(document.body.querySelector('.app-modal')).toBeTruthy()
  })

  it('emits update:visible(false) on Escape keydown', () => {
    const wrapper = mount(AppModal, {
      props: { visible: true, title: 'Test Modal' },
      attachTo: document.body,
    })
    // ESC handler is registered on document via onMounted
    const event = new KeyboardEvent('keydown', { key: 'Escape' })
    document.dispatchEvent(event)
    expect(wrapper.emitted('update:visible')).toBeTruthy()
    expect(wrapper.emitted('update:visible')![0]).toEqual([false])
  })

  it('emits update:visible(false) on backdrop overlay click', async () => {
    const wrapper = mount(AppModal, {
      props: { visible: true, title: 'Test Modal' },
      attachTo: document.body,
    })
    const overlay = document.body.querySelector('.app-modal__overlay') as HTMLElement
    expect(overlay).toBeTruthy()
    overlay.click()
    expect(wrapper.emitted('update:visible')).toBeTruthy()
    expect(wrapper.emitted('update:visible')![0]).toEqual([false])
  })
})
