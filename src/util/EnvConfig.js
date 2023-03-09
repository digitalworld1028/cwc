
const dev = {
    s3: {
        REGION: "us-east-1",
        CASE_BUCKET: "flow360cases-v1",
        MESH_BUCKET: "flow360meshes-v1",
        STUDIO_BUCKET: "flow360-studio-v1"
    },
    webapiV1: {
        REGION: 'us-east-1',
    },
    webapiV2: {
        URL: "https://webapi-dev.flexcompute.com",
        //URL: "http://localhost:5000",
    },
    cognito: {
        REGION: "us-east-1",
        USER_POOL_ID: "us-east-1_t41TfpFiq",
        APP_CLIENT_ID: "58h5c2luqdrads6cpjtbjmabjr",
        IDENTITY_POOL_ID: "us-east-1:7d23a768-ca1c-446b-b91b-31d3e1fe968a"
    }
};

const prod = {
    s3: {
        REGION: "us-gov-west-1",
        CASE_BUCKET: "flow360cases",
        MESH_BUCKET: "flow360meshes",
        STUDIO_BUCKET: "flow360studio"
    },
    webapiV1: {
        REGION: 'us-gov-west-1',
        URL: " /beta-1",
        SERVER: 'dsxjn7ioqe.execute-api.us-gov-west-1.amazonaws.com'
    },
    webapiV2: {
        URL: "https://webapi.flexcompute.com",
    },
    cognito: {
        REGION: "us-east-1",
        USER_POOL_ID: "us-east-1_Csq1uNAO3",
        APP_CLIENT_ID: "scepvluho5eeehv297pvdunk5",
        IDENTITY_POOL_ID: "us-east-1:68a3cf31-60fc-4def-8db2-4c3d48070756"
    }
};

export const config = process.env.REACT_APP_RUNTIME_ENV === 'PROD'
    ? prod
    : dev;
