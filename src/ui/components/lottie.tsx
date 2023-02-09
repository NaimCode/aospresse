/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { useLottie } from 'lottie-react';
import React, { type FunctionComponent } from 'react'

type LottieProps={

    animationData:any
}

const Lottie:FunctionComponent<LottieProps> = ({animationData}) => {
    const options = {
        animationData,
        loop: true
    };

    const { View } = useLottie(options);

    return <>{View}</>;
}

export default Lottie