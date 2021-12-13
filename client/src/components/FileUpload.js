import React, { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import Button from '@mui/material/Button';

const thumbsContainer = {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16
};

const thumb = {
    display: 'inline-flex',
    borderRadius: 2,
    border: '1px solid #eaeaea',
    marginBottom: 8,
    marginRight: 8,
    width: 100,
    height: 100,
    padding: 4,
    boxSizing: 'border-box'
};

const thumbInner = {
    display: 'flex',
    minWidth: 0,
    overflow: 'hidden'
};

const img = {
    display: 'block',
    width: 'auto',
    height: '100%'
};


const FileUpload = ({ files, setFiles }) => {
    const { getRootProps, getInputProps } = useDropzone({
        accept: 'image/*,.pdf',
        onDrop: acceptedFiles => {
            setFiles(acceptedFiles.map(file => Object.assign(file, {
                preview: URL.createObjectURL(file)
            })));
        },
        multiple: false
    });

    const thumbs = files && files.map(file => (
        <div style={thumb} key={file.name}>
            <div style={thumbInner}>
                <img
                    src={file.preview}
                    style={img}
                />
            </div>
        </div>
    ));




    useEffect(() => () => {
        // Make sure to revoke the data uris to avoid memory leaks
        files && files.forEach(file => URL.revokeObjectURL(file.preview));
    }, [files]);






    return (
        <section className="container">
            <div style={{ background: "#f1f1f1", opacity: "0.8", padding: '20px' }} {...getRootProps({ className: 'dropzone' })}>
                <input {...getInputProps()} />
                {files && files.length > 0 ? <p>{`${files.length} file added`}</p> : <p>Drag 'n' drop some file here, that you want to send</p>
                }
            </div>
            <aside style={thumbsContainer}>
                {thumbs}
            </aside>
        </section>
    );
}

export default FileUpload