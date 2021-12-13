
import { createState, useState } from '@hookstate/core';




const state = createState(() => {
    return { qr: null, isActive: false, activeSession: null, sessionLoading: false, sessionName: null }
})



export const useSessionState = () => {
    return useState(state)
}


export const updateSessionState = (obj) => {
    state.merge(obj)
}

