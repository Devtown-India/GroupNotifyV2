
import { createState, useState } from '@hookstate/core';




const state = createState(() => {
    return { token: null, email: null }
})



export const useAuthState = () => {
    return useState(state)
}


export const updateAuthState = (obj) => {
    state.merge(obj)
}

