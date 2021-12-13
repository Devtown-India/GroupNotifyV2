
import { createState, useState } from '@hookstate/core';




const state = createState(() => {
    return { loading: false }
})



export const useLoaderState = () => {
    return useState(state)
}


export const updateLoaderState = (obj) => {
    state.merge(obj)
}

