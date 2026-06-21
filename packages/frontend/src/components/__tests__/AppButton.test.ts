import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppButton from '@/components/AppButton.vue'

describe('AppButton.vue', () => {
  it('renders primary variant with bg-primary-500 class', () => {
    const wrapper = mount(AppButton, {
      props: { variant: 'primary' },
      slots: { default: 'Click me' },
    })
    expect(wrapper.classes()).toContain('bg-primary-500')
  })

  it('disables button and shows spinner when loading is true', () => {
    const wrapper = mount(AppButton, {
      props: { loading: true },
    })
    // Button should be disabled
    expect(wrapper.attributes('disabled')).toBeDefined()
    // Spinner icon should be present
    expect(wrapper.find('i.fa-spinner').exists()).toBe(true)
  })

  it('emits click event when clicked', async () => {
    const wrapper = mount(AppButton, {
      props: { variant: 'primary' },
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })
})
