/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {Cloudinary} from "@cloudinary/url-gen";
import { env } from '@env/server.mjs';

const cloudy:Cloudinary = new Cloudinary({
    cloud: {
      cloudName:env.NEXT_PUBLIC_CLOUDY_NAME_CLIENT
    }
  });


  export default cloudy