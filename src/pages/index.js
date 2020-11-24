import { useEffect, useCallback, useState, useRef, useMemo } from 'react';
import io from 'socket.io-client';
import { v4 as uuid } from 'uuid';
import classnames from 'classnames';
import { Button, Input } from 'antd';
import styles from './index.less';

function SocketDemo(props) {
  const chatBoxRef = useRef();
  const socketRef = useRef();
  const [onlineUserList, setOnlineUserList] = useState([]);
  const [msgList, setMsgList] = useState([]);
  const [value, setValue] = useState();
  const [user, setUser] = useState();
  const [name, setName] = useState();

  useEffect(() => {
    const clearFunc = () => {
      if (!socketRef.current) return;
      socketRef.current.off('chat message');
      socketRef.current.off('disconnect');
    };
    if (!user) {
      return clearFunc;
    }

    socketRef.current.on('enter', data => {
      const { onlineUserList, msgList } = data;
      setOnlineUserList(onlineUserList);
      setMsgList(msgList);
    });

    socketRef.current.on('leave', data => {
      const { onlineUserList } = data;
      setOnlineUserList(onlineUserList);
    });

    //收到server消息
    socketRef.current.on('chat message', data => {
      const { msgList } = data;
      setMsgList(msgList);
    });
    return clearFunc;
  }, [user]);

  const onNameChange = useCallback(e => {
    setName(e.target.value.trim());
  }, []);

  const handleEnter = useCallback(() => {
    const user = { id: uuid(), name };
    const socket = io(`http://${window.location.hostname}:3000/chat`, {
      query: { ...user },
    });
    socket.emit('enter', { user });
    setUser(user);
    setName();
    socketRef.current = socket;
  }, [name]);

  const onChange = useCallback(e => {
    setValue(e.target.value);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit('chat message', value);
    setValue();
    chatBoxRef.current.scrollTop = 0;
  }, [value]);

  const finalMsgList = useMemo(() => {
    return msgList.reverse();
  }, [msgList]);

  if (!user) {
    return (
      <div className={styles.container}>
        <Input
          value={name}
          onChange={onNameChange}
          placeholder="请输入你的昵称"
          addonAfter={
            <Button disabled={!name} className={styles.submit} type="link" onClick={handleEnter}>
              确定
            </Button>
          }
          style={{ marginTop: 20 }}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <p className={styles.online}>
        在线人数：<span>{onlineUserList.length}</span>人
      </p>
      <div className={styles.chatBox} ref={chatBoxRef}>
        {finalMsgList.map((n, i) => {
          const { id, text } = n;
          const myself = n.userId === user.id;
          return (
            <div key={id} className={classnames(styles.item, { [styles.reverse]: myself })}>
              <span title={n.userName}>{!myself ? n.userName?.toUpperCase()[0] : '我'}</span>
              <p>{text}</p>
            </div>
          );
        })}
      </div>
      <Input
        value={value}
        onChange={onChange}
        addonAfter={
          <Button className={styles.submit} type="link" onClick={handleSubmit}>
            发送
          </Button>
        }
      />
    </div>
  );
}

SocketDemo.propTypes = {};

export default SocketDemo;
